import type { FastifyRequest, FastifyReply } from "fastify";
import { ObjectId } from "@fastify/mongodb";
import {
  generateInvoiceSchema,
  generateBusinessInvoiceSchema,
  approveInvoiceSchema,
  addInvoiceAdjustmentSchema,
} from "../../types/invoice.types.js";
import {
  calculateInvoiceFinancials,
  resolveHourlyCompensationProfile,
  buildPhpConversion,
} from "./invoice.calculator.service.js";

interface IdParams {
  id: string;
}

interface BusinessIdParams {
  businessId: string;
}

interface StaffIdParams {
  staffId: string;
}

interface InvoiceQuery {
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: string;
  limit?: string;
}

// ==================== INVOICE GENERATION ====================

// Generate invoice for a single staff member
export async function generateInvoice(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const db = request.server.mongo.db;
  const invoices = db?.collection("invoices");
  const eodReports = db?.collection("eod_reports");
  const staff = db?.collection("staff");
  const businesses = db?.collection("businesses");

  if (!db || !invoices || !eodReports || !staff || !businesses) {
    return reply.status(500).send({ error: "Database not available" });
  }

  const parseResult = generateInvoiceSchema.safeParse(request.body);
  if (!parseResult.success) {
    return reply.status(400).send({
      error: "Validation failed",
      details: parseResult.error.errors,
    });
  }

  const { staffId, periodStart, periodEnd } = parseResult.data;

  if (!ObjectId.isValid(staffId)) {
    return reply.status(400).send({ error: "Invalid staff ID format" });
  }

  // Get staff member
  const staffMember = await staff.findOne({
    _id: new ObjectId(staffId),
    isActive: true,
  });

  if (!staffMember) {
    return reply.status(404).send({ error: "Staff member not found" });
  }

  // Check business access (unless super-admin)
  if (request.user.role !== "super-admin") {
    const business = await businesses.findOne({
      _id: new ObjectId(staffMember.businessId),
      adminIds: request.user.id,
    });

    if (!business) {
      return reply.status(403).send({
        error: "Forbidden",
        message: "You do not have access to this staff member's business",
      });
    }
  }

  // Check for duplicate invoice
  const existingInvoice = await invoices.findOne({
    staffId,
    businessId: staffMember.businessId,
    periodStart,
    periodEnd,
    isActive: true,
  });

  if (existingInvoice) {
    return reply.status(409).send({
      error: "Invoice already exists",
      message: "An invoice already exists for this staff member and period",
      invoiceId: existingInvoice._id,
    });
  }

  // Validate staff has salary info
  if (!staffMember.salary) {
    return reply.status(400).send({
      error: "Missing salary information",
      message:
        "Staff member does not have salary configuration. Please update staff salary info first.",
    });
  }

  // Get approved EOD reports for the period
  const eodRecords = await eodReports
    .find({
      staffId,
      businessId: staffMember.businessId,
      isApproved: true,
      isActive: true,
      date: { $gte: periodStart, $lte: periodEnd },
    })
    .toArray();

  const compensation = await resolveHourlyCompensationProfile(
    db,
    staffMember,
    periodEnd,
  );

  const financials = calculateInvoiceFinancials(
    eodRecords,
    compensation,
    [],
    [],
    periodEnd,
    compensation.currency,
  );

  const eodIds = eodRecords.map((record) => record._id.toString());

  const now = new Date().toISOString();
  // Compute PHP conversion before inserting
  const phpConversion = await buildPhpConversion(
    db,
    compensation.currency,
    {
      baseSalary: compensation.hourlyRate,
      calculatedPay: financials.calculatedPay,
      netPay: financials.netPay,
      earningsBreakdown: financials.earningsBreakdown,
    },
    financials.statutoryDeductions,
  );

  const newInvoice: any = {
    staffId,
    businessId: staffMember.businessId,
    currency: compensation.currency,
    staffName: `${staffMember.firstName} ${staffMember.lastName}`,
    staffEmail: staffMember.email,
    staffPosition: staffMember.position || "",
    periodStart,
    periodEnd,
    totalHoursWorked: financials.totalHoursWorked,
    totalDaysWorked: financials.totalDaysWorked,
    salaryType: "hourly" as const,
    baseSalary: compensation.hourlyRate,
    calculatedPay: financials.calculatedPay,
    earningsBreakdown: financials.earningsBreakdown,
    statutoryDeductions: financials.statutoryDeductions,
    deductions: financials.deductions,
    additions: [],
    netPay: financials.netPay,
    ...(phpConversion ? { phpConversion } : {}),
    eodIds,
    eodCount: eodRecords.length,
    status: "draft" as const,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  const result = await invoices.insertOne(newInvoice);

  return reply.status(201).send({
    _id: result.insertedId,
    ...newInvoice,
    message: "Invoice generated successfully",
  });
}

// Generate invoices for all hourly staff in a business
export async function generateBusinessInvoices(
  request: FastifyRequest<{ Params: BusinessIdParams }>,
  reply: FastifyReply,
) {
  const db = request.server.mongo.db;
  const invoices = db?.collection("invoices");
  const eodReports = db?.collection("eod_reports");
  const staffCollection = db?.collection("staff");
  const businesses = db?.collection("businesses");

  if (!db || !invoices || !eodReports || !staffCollection || !businesses) {
    return reply.status(500).send({ error: "Database not available" });
  }

  const { businessId } = request.params;

  if (!ObjectId.isValid(businessId)) {
    return reply.status(400).send({ error: "Invalid business ID format" });
  }

  const parseResult = generateBusinessInvoiceSchema.safeParse(request.body);
  if (!parseResult.success) {
    return reply.status(400).send({
      error: "Validation failed",
      details: parseResult.error.errors,
    });
  }

  const { periodStart, periodEnd } = parseResult.data;

  // Check business access (unless super-admin)
  if (request.user.role !== "super-admin") {
    const business = await businesses.findOne({
      _id: new ObjectId(businessId),
      adminIds: request.user.id,
    });

    if (!business) {
      return reply.status(403).send({
        error: "Forbidden",
        message: "You do not have access to this business",
      });
    }
  }

  // Fetch all active staff; invoice computation is unified hourly-only
  const staffMembers = await staffCollection
    .find({
      businessId,
      isActive: true,
      status: "active",
    })
    .toArray();

  const results = {
    generated: [] as any[],
    skipped: [] as any[],
    errors: [] as any[],
  };

  for (const staffMember of staffMembers) {
    try {
      const staffId = staffMember._id.toString();

      // Check for duplicate
      const existingInvoice = await invoices.findOne({
        staffId,
        businessId,
        periodStart,
        periodEnd,
        isActive: true,
      });

      if (existingInvoice) {
        results.skipped.push({
          staffId,
          staffName: `${staffMember.firstName} ${staffMember.lastName}`,
          reason: "Invoice already exists for this period",
        });
        continue;
      }

      // Check salary info
      if (!staffMember.salary) {
        results.errors.push({
          staffId,
          staffName: `${staffMember.firstName} ${staffMember.lastName}`,
          reason: "Missing salary configuration",
        });
        continue;
      }

      // Get approved EOD reports
      const eodRecords = await eodReports
        .find({
          staffId,
          businessId,
          isApproved: true,
          isActive: true,
          date: { $gte: periodStart, $lte: periodEnd },
        })
        .toArray();

      const compensation = await resolveHourlyCompensationProfile(
        db,
        staffMember,
        periodEnd,
      );

      const financials = calculateInvoiceFinancials(
        eodRecords,
        compensation,
        [],
        [],
        periodEnd,
        compensation.currency,
      );

      const eodIds = eodRecords.map((record) => record._id.toString());

      const now = new Date().toISOString();

      // Compute PHP conversion before inserting
      const phpConversion = await buildPhpConversion(
        db,
        compensation.currency,
        {
          baseSalary: compensation.hourlyRate,
          calculatedPay: financials.calculatedPay,
          netPay: financials.netPay,
          earningsBreakdown: financials.earningsBreakdown,
        },
        financials.statutoryDeductions,
      );

      const newInvoice: any = {
        staffId,
        businessId,
        currency: compensation.currency,
        staffName: `${staffMember.firstName} ${staffMember.lastName}`,
        staffEmail: staffMember.email,
        staffPosition: staffMember.position || "",
        periodStart,
        periodEnd,
        totalHoursWorked: financials.totalHoursWorked,
        totalDaysWorked: financials.totalDaysWorked,
        salaryType: "hourly" as const,
        baseSalary: compensation.hourlyRate,
        calculatedPay: financials.calculatedPay,
        earningsBreakdown: financials.earningsBreakdown,
        statutoryDeductions: financials.statutoryDeductions,
        deductions: financials.deductions,
        additions: [],
        netPay: financials.netPay,
        ...(phpConversion ? { phpConversion } : {}),
        eodIds,
        eodCount: eodRecords.length,
        status: "draft" as const,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };

      const result = await invoices.insertOne(newInvoice);

      results.generated.push({
        _id: result.insertedId,
        staffId,
        staffName: `${staffMember.firstName} ${staffMember.lastName}`,
        calculatedPay: financials.calculatedPay,
        netPay: financials.netPay,
      });
    } catch (err) {
      results.errors.push({
        staffId: staffMember._id.toString(),
        staffName: `${staffMember.firstName} ${staffMember.lastName}`,
        reason: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  return {
    message: "Batch invoice generation completed",
    summary: {
      total: staffMembers.length,
      generated: results.generated.length,
      skipped: results.skipped.length,
      errors: results.errors.length,
    },
    ...results,
  };
}

// ==================== RECALCULATE ====================

// Recalculate invoice from current approved EODs (admin only — draft/calculated only)
export async function recalculateInvoice(
  request: FastifyRequest<{ Params: IdParams }>,
  reply: FastifyReply,
) {
  const db = request.server.mongo.db;
  const invoices = db?.collection("invoices");
  const eodReports = db?.collection("eod_reports");
  const businesses = db?.collection("businesses");
  const staff = db?.collection("staff");

  if (!db || !invoices || !eodReports || !businesses || !staff) {
    return reply.status(500).send({ error: "Database not available" });
  }

  const { id } = request.params;

  if (!ObjectId.isValid(id)) {
    return reply.status(400).send({ error: "Invalid invoice ID format" });
  }

  const invoice = await invoices.findOne({
    _id: new ObjectId(id),
    isActive: true,
  });

  if (!invoice) {
    return reply.status(404).send({ error: "Invoice not found" });
  }

  // Only allow recalculate on draft or calculated invoices
  if (invoice.status === "approved" || invoice.status === "paid") {
    return reply.status(400).send({
      error: "Cannot recalculate",
      message: `Cannot recalculate an invoice with status '${invoice.status}'. Only draft or calculated invoices can be recalculated.`,
    });
  }

  // Check business access (unless super-admin)
  if (request.user.role !== "super-admin") {
    const business = await businesses.findOne({
      _id: new ObjectId(invoice.businessId),
      adminIds: request.user.id,
    });

    if (!business) {
      return reply.status(403).send({
        error: "Forbidden",
        message: "You do not have access to this invoice",
      });
    }
  }

  // Store previous values for comparison
  const previousTotal = invoice.totalHoursWorked;
  const previousEodIds = new Set(invoice.eodIds || []);

  // Re-query all currently approved EODs for the period
  const eodRecords = await eodReports
    .find({
      staffId: invoice.staffId,
      businessId: invoice.businessId,
      isApproved: true,
      isActive: true,
      date: { $gte: invoice.periodStart, $lte: invoice.periodEnd },
    })
    .toArray();

  const eodIds = eodRecords.map((record) => record._id.toString());
  const newEodIdSet = new Set(eodIds);

  // Calculate how many EODs were added/removed
  const eodsAdded = eodIds.filter((eid) => !previousEodIds.has(eid)).length;
  const eodsRemoved = [...previousEodIds].filter(
    (eid) => !newEodIdSet.has(eid as string),
  ).length;

  const staffMember = await staff.findOne({
    _id: new ObjectId(invoice.staffId),
    isActive: true,
  });

  if (!staffMember) {
    return reply.status(404).send({ error: "Staff member not found" });
  }

  const compensation = await resolveHourlyCompensationProfile(
    db,
    staffMember,
    invoice.periodEnd,
  );

  const financials = calculateInvoiceFinancials(
    eodRecords,
    compensation,
    invoice.additions || [],
    invoice.deductions || [],
    invoice.periodEnd,
    compensation.currency,
  );

  const now = new Date().toISOString();

  // Compute PHP conversion for recalculated values
  const phpConversion = await buildPhpConversion(
    db,
    compensation.currency,
    {
      baseSalary: compensation.hourlyRate,
      calculatedPay: financials.calculatedPay,
      netPay: financials.netPay,
      earningsBreakdown: financials.earningsBreakdown,
    },
    financials.statutoryDeductions,
  );

  const $set: any = {
    currency: compensation.currency,
    totalHoursWorked: financials.totalHoursWorked,
    totalDaysWorked: financials.totalDaysWorked,
    eodIds,
    eodCount: eodRecords.length,
    salaryType: "hourly",
    baseSalary: compensation.hourlyRate,
    calculatedPay: financials.calculatedPay,
    earningsBreakdown: financials.earningsBreakdown,
    statutoryDeductions: financials.statutoryDeductions,
    deductions: financials.deductions,
    netPay: financials.netPay,
    updatedAt: now,
  };

  if (phpConversion) {
    $set.phpConversion = phpConversion;
  } else {
    // Remove stale phpConversion if currency changed to PHP
    $set.phpConversion = null;
  }

  const result = await invoices.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set },
    { returnDocument: "after" },
  );

  return {
    ...result,
    message: "Invoice recalculated successfully",
    recalculation: {
      previousHoursWorked: previousTotal,
      newHoursWorked: financials.totalHoursWorked,
      previousPay: invoice.calculatedPay,
      newPay: financials.calculatedPay,
      eodsAdded,
      eodsRemoved,
    },
  };
}

// ==================== INVOICE RETRIEVAL ====================

// Get all invoices (admin — filtered by business access)
export async function getAllInvoices(
  request: FastifyRequest<{
    Querystring: InvoiceQuery & { businessId?: string; staffId?: string };
  }>,
  reply: FastifyReply,
) {
  const db = request.server.mongo.db;
  const invoices = db?.collection("invoices");
  const businesses = db?.collection("businesses");

  if (!db || !invoices || !businesses) {
    return reply.status(500).send({ error: "Database not available" });
  }

  const query: any = { isActive: true };

  if (request.query.businessId) {
    if (!ObjectId.isValid(request.query.businessId)) {
      return reply.status(400).send({ error: "Invalid business ID format" });
    }
    query.businessId = request.query.businessId;
  }

  if (request.query.staffId) {
    query.staffId = request.query.staffId;
  }

  if (request.query.status) {
    query.status = request.query.status;
  }

  if (request.query.startDate || request.query.endDate) {
    query.periodStart = {};
    if (request.query.startDate) {
      query.periodStart.$gte = request.query.startDate;
    }
    if (request.query.endDate) {
      query.periodStart.$lte = request.query.endDate;
    }
  }

  // If not super-admin, restrict to accessible businesses
  if (request.user.role !== "super-admin") {
    const accessibleBusinesses = await businesses
      .find({ adminIds: request.user.id, isActive: true })
      .project({ _id: 1 })
      .toArray();

    const businessIds = accessibleBusinesses.map((b) => b._id.toString());

    if (query.businessId && !businessIds.includes(query.businessId)) {
      return reply.status(403).send({
        error: "Forbidden",
        message: "You do not have access to this business",
      });
    }

    if (!query.businessId) {
      query.businessId = { $in: businessIds };
    }
  }

  const result = await invoices.find(query).sort({ periodStart: -1 }).toArray();

  return result;
}

// Get invoice by ID
export async function getInvoiceById(
  request: FastifyRequest<{ Params: IdParams }>,
  reply: FastifyReply,
) {
  const db = request.server.mongo.db;
  const invoices = db?.collection("invoices");
  const businesses = db?.collection("businesses");
  const staff = db?.collection("staff");
  const eodReports = db?.collection("eod_reports");

  if (!db || !invoices || !businesses || !staff || !eodReports) {
    return reply.status(500).send({ error: "Database not available" });
  }

  const { id } = request.params;

  if (!ObjectId.isValid(id)) {
    return reply.status(400).send({ error: "Invalid invoice ID format" });
  }

  const invoice = await invoices.findOne({
    _id: new ObjectId(id),
    isActive: true,
  });

  if (!invoice) {
    return reply.status(404).send({ error: "Invoice not found" });
  }

  // Check business access (unless super-admin)
  if (request.user.role !== "super-admin") {
    const business = await businesses.findOne({
      _id: new ObjectId(invoice.businessId),
      adminIds: request.user.id,
    });

    if (!business) {
      return reply.status(403).send({
        error: "Forbidden",
        message: "You do not have access to this invoice",
      });
    }
  }

  // Enrich with staff details
  const staffMember = await staff.findOne({
    _id: new ObjectId(invoice.staffId),
  });

  // Fetch linked EOD reports
  const linkedEods =
    invoice.eodIds && invoice.eodIds.length > 0
      ? await eodReports
          .find({
            _id: {
              $in: invoice.eodIds.map((eid: string) => new ObjectId(eid)),
            },
          })
          .sort({ date: 1 })
          .toArray()
      : [];

  return {
    ...invoice,
    staff: staffMember
      ? {
          firstName: staffMember.firstName,
          lastName: staffMember.lastName,
          email: staffMember.email,
          position: staffMember.position,
        }
      : null,
    eodReports: linkedEods,
  };
}

// Get invoices by business (paginated)
export async function getInvoicesByBusiness(
  request: FastifyRequest<{
    Params: BusinessIdParams;
    Querystring: InvoiceQuery;
  }>,
  reply: FastifyReply,
) {
  const db = request.server.mongo.db;
  const invoices = db?.collection("invoices");
  const businesses = db?.collection("businesses");
  const staffCollection = db?.collection("staff");

  if (!db || !invoices || !businesses || !staffCollection) {
    return reply.status(500).send({ error: "Database not available" });
  }

  const { businessId } = request.params;

  if (!ObjectId.isValid(businessId)) {
    return reply.status(400).send({ error: "Invalid business ID format" });
  }

  // Check business access (unless super-admin)
  if (request.user.role !== "super-admin") {
    const business = await businesses.findOne({
      _id: new ObjectId(businessId),
      adminIds: request.user.id,
    });

    if (!business) {
      return reply.status(403).send({
        error: "Forbidden",
        message: "You do not have access to this business",
      });
    }
  }

  // Pagination
  const page = Math.max(1, parseInt(request.query.page || "1", 10));
  const limit = Math.min(
    100,
    Math.max(1, parseInt(request.query.limit || "20", 10)),
  );
  const skip = (page - 1) * limit;

  const query: any = { businessId, isActive: true };

  if (request.query.status) {
    query.status = request.query.status;
  }

  if (request.query.startDate || request.query.endDate) {
    query.periodStart = {};
    if (request.query.startDate) {
      query.periodStart.$gte = request.query.startDate;
    }
    if (request.query.endDate) {
      query.periodStart.$lte = request.query.endDate;
    }
  }

  // Search by staff name or email
  if (request.query.search) {
    const searchRegex = new RegExp(request.query.search, "i");
    const matchingStaff = await staffCollection
      .find({
        businessId,
        isActive: true,
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { email: searchRegex },
        ],
      })
      .project({ _id: 1 })
      .toArray();

    const matchingStaffIds = matchingStaff.map((s) => s._id.toString());
    query.staffId = { $in: matchingStaffIds };
  }

  const [result, totalCount] = await Promise.all([
    invoices
      .find(query)
      .sort({ periodStart: -1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
    invoices.countDocuments(query),
  ]);

  // Enrich with staff details
  const staffIds = [...new Set(result.map((r) => r.staffId))];
  const staffMembers = staffIds.length
    ? await staffCollection
        .find({
          _id: { $in: staffIds.map((id) => new ObjectId(id)) },
        })
        .project({
          _id: 1,
          firstName: 1,
          lastName: 1,
          email: 1,
          position: 1,
        })
        .toArray()
    : [];

  const staffMap = new Map(
    staffMembers.map((s) => [
      s._id.toString(),
      {
        staffName: `${s.firstName} ${s.lastName}`,
        staffEmail: s.email,
        staffPosition: s.position,
      },
    ]),
  );

  const staffEnriched = result.map((r) => ({
    ...r,
    ...(staffMap.get(r.staffId) || {}),
  }));

  const totalPages = Math.ceil(totalCount / limit);

  return {
    data: staffEnriched,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

// Get invoices by staff
export async function getInvoicesByStaff(
  request: FastifyRequest<{
    Params: StaffIdParams;
    Querystring: InvoiceQuery;
  }>,
  reply: FastifyReply,
) {
  const db = request.server.mongo.db;
  const invoices = db?.collection("invoices");
  const staff = db?.collection("staff");
  const businesses = db?.collection("businesses");

  if (!db || !invoices || !staff || !businesses) {
    return reply.status(500).send({ error: "Database not available" });
  }

  const { staffId } = request.params;

  if (!ObjectId.isValid(staffId)) {
    return reply.status(400).send({ error: "Invalid staff ID format" });
  }

  const staffMember = await staff.findOne({ _id: new ObjectId(staffId) });
  if (!staffMember) {
    return reply.status(404).send({ error: "Staff member not found" });
  }

  // Check business access (unless super-admin)
  if (request.user.role !== "super-admin") {
    const business = await businesses.findOne({
      _id: new ObjectId(staffMember.businessId),
      adminIds: request.user.id,
    });

    if (!business) {
      return reply.status(403).send({
        error: "Forbidden",
        message: "You do not have access to this staff member's business",
      });
    }
  }

  const query: any = { staffId, isActive: true };

  if (request.query.status) {
    query.status = request.query.status;
  }

  if (request.query.startDate || request.query.endDate) {
    query.periodStart = {};
    if (request.query.startDate) {
      query.periodStart.$gte = request.query.startDate;
    }
    if (request.query.endDate) {
      query.periodStart.$lte = request.query.endDate;
    }
  }

  const result = await invoices.find(query).sort({ periodStart: -1 }).toArray();

  return result;
}

// ==================== INVOICE ACTIONS ====================

// Approve invoice
export async function approveInvoice(
  request: FastifyRequest<{ Params: IdParams }>,
  reply: FastifyReply,
) {
  const invoices = request.server.mongo.db?.collection("invoices");
  const businesses = request.server.mongo.db?.collection("businesses");

  if (!invoices || !businesses) {
    return reply.status(500).send({ error: "Database not available" });
  }

  const { id } = request.params;

  if (!ObjectId.isValid(id)) {
    return reply.status(400).send({ error: "Invalid invoice ID format" });
  }

  const parseResult = approveInvoiceSchema.safeParse(request.body);
  const notes = parseResult.success ? parseResult.data.notes : undefined;

  const invoice = await invoices.findOne({
    _id: new ObjectId(id),
    isActive: true,
  });

  if (!invoice) {
    return reply.status(404).send({ error: "Invoice not found" });
  }

  if (invoice.status === "paid") {
    return reply.status(400).send({
      error: "Cannot modify paid invoice",
      message: "This invoice has already been paid",
    });
  }

  if (invoice.status === "approved") {
    return reply.status(400).send({
      error: "Already approved",
      message: "This invoice has already been approved",
    });
  }

  // Check business access (unless super-admin)
  if (request.user.role !== "super-admin") {
    const business = await businesses.findOne({
      _id: new ObjectId(invoice.businessId),
      adminIds: request.user.id,
    });

    if (!business) {
      return reply.status(403).send({
        error: "Forbidden",
        message: "You do not have access to this invoice",
      });
    }
  }

  const now = new Date().toISOString();
  const result = await invoices.findOneAndUpdate(
    { _id: new ObjectId(id) },
    {
      $set: {
        status: "approved",
        approvedBy: request.user.id,
        approvedAt: now,
        notes: notes || invoice.notes,
        updatedAt: now,
      },
    },
    { returnDocument: "after" },
  );

  return {
    ...result,
    message: "Invoice approved successfully",
  };
}

// Mark invoice as paid
export async function markInvoicePaid(
  request: FastifyRequest<{ Params: IdParams }>,
  reply: FastifyReply,
) {
  const invoices = request.server.mongo.db?.collection("invoices");
  const businesses = request.server.mongo.db?.collection("businesses");

  if (!invoices || !businesses) {
    return reply.status(500).send({ error: "Database not available" });
  }

  const { id } = request.params;

  if (!ObjectId.isValid(id)) {
    return reply.status(400).send({ error: "Invalid invoice ID format" });
  }

  const invoice = await invoices.findOne({
    _id: new ObjectId(id),
    isActive: true,
  });

  if (!invoice) {
    return reply.status(404).send({ error: "Invoice not found" });
  }

  if (invoice.status === "paid") {
    return reply.status(400).send({
      error: "Already paid",
      message: "This invoice has already been marked as paid",
    });
  }

  if (invoice.status !== "approved") {
    return reply.status(400).send({
      error: "Not approved",
      message: "Invoice must be approved before it can be marked as paid",
    });
  }

  // Check business access (unless super-admin)
  if (request.user.role !== "super-admin") {
    const business = await businesses.findOne({
      _id: new ObjectId(invoice.businessId),
      adminIds: request.user.id,
    });

    if (!business) {
      return reply.status(403).send({
        error: "Forbidden",
        message: "You do not have access to this invoice",
      });
    }
  }

  const now = new Date().toISOString();
  const result = await invoices.findOneAndUpdate(
    { _id: new ObjectId(id) },
    {
      $set: {
        status: "paid",
        paidAt: now,
        updatedAt: now,
      },
    },
    { returnDocument: "after" },
  );

  return {
    ...result,
    message: "Invoice marked as paid",
  };
}

// Add adjustment (deduction or addition)
export async function addInvoiceAdjustment(
  request: FastifyRequest<{ Params: IdParams }>,
  reply: FastifyReply,
) {
  const invoices = request.server.mongo.db?.collection("invoices");
  const businesses = request.server.mongo.db?.collection("businesses");

  if (!invoices || !businesses) {
    return reply.status(500).send({ error: "Database not available" });
  }

  const { id } = request.params;

  if (!ObjectId.isValid(id)) {
    return reply.status(400).send({ error: "Invalid invoice ID format" });
  }

  const parseResult = addInvoiceAdjustmentSchema.safeParse(request.body);
  if (!parseResult.success) {
    return reply.status(400).send({
      error: "Validation failed",
      details: parseResult.error.errors,
    });
  }

  const { type, adjustmentType, description, amount } = parseResult.data;

  const invoice = await invoices.findOne({
    _id: new ObjectId(id),
    isActive: true,
  });

  if (!invoice) {
    return reply.status(404).send({ error: "Invoice not found" });
  }

  if (invoice.status === "paid") {
    return reply.status(400).send({
      error: "Cannot modify paid invoice",
      message: "This invoice has already been paid",
    });
  }

  if (invoice.status === "approved") {
    return reply.status(400).send({
      error: "Cannot modify approved invoice",
      message:
        "This invoice has been approved. Revoke approval first to add adjustments.",
    });
  }

  // Check business access (unless super-admin)
  if (request.user.role !== "super-admin") {
    const business = await businesses.findOne({
      _id: new ObjectId(invoice.businessId),
      adminIds: request.user.id,
    });

    if (!business) {
      return reply.status(403).send({
        error: "Forbidden",
        message: "You do not have access to this invoice",
      });
    }
  }

  const adjustment = {
    type: adjustmentType,
    description,
    amount,
  };

  const updateField = type === "deduction" ? "deductions" : "additions";

  // Calculate new net pay
  const deductionsTotal =
    type === "deduction"
      ? [...invoice.deductions, adjustment].reduce(
          (sum: number, d: any) => sum + d.amount,
          0,
        )
      : invoice.deductions.reduce((sum: number, d: any) => sum + d.amount, 0);

  const additionsTotal =
    type === "addition"
      ? [...invoice.additions, adjustment].reduce(
          (sum: number, a: any) => sum + a.amount,
          0,
        )
      : invoice.additions.reduce((sum: number, a: any) => sum + a.amount, 0);

  const newNetPay = invoice.calculatedPay + additionsTotal - deductionsTotal;

  const now = new Date().toISOString();
  const result = await invoices.findOneAndUpdate(
    { _id: new ObjectId(id) },
    {
      $push: { [updateField]: adjustment } as any,
      $set: {
        netPay: Math.round(newNetPay * 100) / 100,
        updatedAt: now,
      },
    },
    { returnDocument: "after" },
  );

  return {
    ...result,
    message: `${type === "deduction" ? "Deduction" : "Addition"} added successfully`,
  };
}

// Remove adjustment
export async function removeInvoiceAdjustment(
  request: FastifyRequest<{
    Params: IdParams;
    Body: { type: "deduction" | "addition"; index: number };
  }>,
  reply: FastifyReply,
) {
  const invoices = request.server.mongo.db?.collection("invoices");
  const businesses = request.server.mongo.db?.collection("businesses");

  if (!invoices || !businesses) {
    return reply.status(500).send({ error: "Database not available" });
  }

  const { id } = request.params;
  const { type, index } = request.body as {
    type: "deduction" | "addition";
    index: number;
  };

  if (!ObjectId.isValid(id)) {
    return reply.status(400).send({ error: "Invalid invoice ID format" });
  }

  const invoice = await invoices.findOne({
    _id: new ObjectId(id),
    isActive: true,
  });

  if (!invoice) {
    return reply.status(404).send({ error: "Invoice not found" });
  }

  if (invoice.status === "paid" || invoice.status === "approved") {
    return reply.status(400).send({
      error: "Cannot modify invoice",
      message: "Cannot remove adjustments from approved or paid invoices",
    });
  }

  // Check business access (unless super-admin)
  if (request.user.role !== "super-admin") {
    const business = await businesses.findOne({
      _id: new ObjectId(invoice.businessId),
      adminIds: request.user.id,
    });

    if (!business) {
      return reply.status(403).send({
        error: "Forbidden",
        message: "You do not have access to this invoice",
      });
    }
  }

  const field = type === "deduction" ? "deductions" : "additions";
  const adjustments = [...invoice[field]];

  if (index < 0 || index >= adjustments.length) {
    return reply.status(400).send({
      error: "Invalid index",
      message: `${type} at index ${index} does not exist`,
    });
  }

  adjustments.splice(index, 1);

  // Recalculate net pay
  const deductionsTotal =
    type === "deduction"
      ? adjustments.reduce((sum: number, d: any) => sum + d.amount, 0)
      : invoice.deductions.reduce((sum: number, d: any) => sum + d.amount, 0);

  const additionsTotal =
    type === "addition"
      ? adjustments.reduce((sum: number, a: any) => sum + a.amount, 0)
      : invoice.additions.reduce((sum: number, a: any) => sum + a.amount, 0);

  const newNetPay = invoice.calculatedPay + additionsTotal - deductionsTotal;

  const now = new Date().toISOString();
  const result = await invoices.findOneAndUpdate(
    { _id: new ObjectId(id) },
    {
      $set: {
        [field]: adjustments,
        netPay: Math.round(newNetPay * 100) / 100,
        updatedAt: now,
      },
    },
    { returnDocument: "after" },
  );

  return {
    ...result,
    message: `${type === "deduction" ? "Deduction" : "Addition"} removed successfully`,
  };
}

// Delete invoice (soft delete)
export async function deleteInvoice(
  request: FastifyRequest<{ Params: IdParams }>,
  reply: FastifyReply,
) {
  const invoices = request.server.mongo.db?.collection("invoices");
  const businesses = request.server.mongo.db?.collection("businesses");

  if (!invoices || !businesses) {
    return reply.status(500).send({ error: "Database not available" });
  }

  const { id } = request.params;

  if (!ObjectId.isValid(id)) {
    return reply.status(400).send({ error: "Invalid invoice ID format" });
  }

  const invoice = await invoices.findOne({
    _id: new ObjectId(id),
    isActive: true,
  });

  if (!invoice) {
    return reply.status(404).send({ error: "Invoice not found" });
  }

  if (invoice.status === "paid") {
    return reply.status(400).send({
      error: "Cannot delete paid invoice",
      message: "Paid invoices cannot be deleted",
    });
  }

  // Check business access (unless super-admin)
  if (request.user.role !== "super-admin") {
    const business = await businesses.findOne({
      _id: new ObjectId(invoice.businessId),
      adminIds: request.user.id,
    });

    if (!business) {
      return reply.status(403).send({
        error: "Forbidden",
        message: "You do not have access to this invoice",
      });
    }
  }

  await invoices.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { isActive: false, updatedAt: new Date().toISOString() } },
  );

  return { message: "Invoice deleted successfully" };
}
