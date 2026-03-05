import { ObjectId } from "@fastify/mongodb";
import { submitEodSchema, editOwnEodSchema, reviewEodSchema, adminEditEodSchema, } from "../../types/eod.types.js";
import { calculateInvoiceFinancials, resolveHourlyCompensationProfile, } from "../invoice/invoice.calculator.service.js";
import { invoiceOnEodApproval } from "../invoice/invoice.eod-hook.service.js";
// ==================== STAFF ACTIONS ====================
// Helper: Get current pay cycle boundaries
function getCurrentPayCycle() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-indexed
    const day = now.getDate();
    if (day <= 15) {
        // Current cycle: 1st – 15th, payout on the 16th
        const start = new Date(year, month, 1);
        const end = new Date(year, month, 15);
        const payout = new Date(year, month, 16);
        return {
            periodStart: start.toISOString().split("T")[0],
            periodEnd: end.toISOString().split("T")[0],
            nextPayoutDate: payout.toISOString().split("T")[0],
        };
    }
    else {
        // Current cycle: 16th – last day, payout on the 1st of next month
        const start = new Date(year, month, 16);
        const lastDay = new Date(year, month + 1, 0).getDate();
        const end = new Date(year, month, lastDay);
        const payout = new Date(year, month + 1, 1);
        return {
            periodStart: start.toISOString().split("T")[0],
            periodEnd: end.toISOString().split("T")[0],
            nextPayoutDate: payout.toISOString().split("T")[0],
        };
    }
}
// Get expected earnings for current pay cycle (staff only — real-time aggregation)
export async function getMyExpectedEarnings(request, reply) {
    const db = request.server.mongo.db;
    const eodReports = db?.collection("eod_reports");
    const staff = db?.collection("staff");
    if (!db || !eodReports || !staff) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const { id: staffId, businessId } = request.user;
    if (!staffId || !businessId) {
        return reply.status(400).send({ error: "Invalid staff token" });
    }
    // Get staff member for salary info
    const staffMember = await staff.findOne({
        _id: new ObjectId(staffId),
        isActive: true,
    });
    if (!staffMember) {
        return reply.status(404).send({ error: "Staff member not found" });
    }
    // Determine period: use query params or auto-detect current cycle
    let periodStart;
    let periodEnd;
    let nextPayoutDate;
    if (request.query.periodStart && request.query.periodEnd) {
        periodStart = request.query.periodStart;
        periodEnd = request.query.periodEnd;
        // Calculate next payout based on period end
        const endDate = new Date(periodEnd);
        const endDay = endDate.getDate();
        if (endDay <= 15) {
            nextPayoutDate = new Date(endDate.getFullYear(), endDate.getMonth(), 16)
                .toISOString()
                .split("T")[0];
        }
        else {
            nextPayoutDate = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 1)
                .toISOString()
                .split("T")[0];
        }
    }
    else {
        const cycle = getCurrentPayCycle();
        periodStart = cycle.periodStart;
        periodEnd = cycle.periodEnd;
        nextPayoutDate = cycle.nextPayoutDate;
    }
    // Query approved EODs
    const approvedEods = await eodReports
        .find({
        staffId,
        businessId,
        isApproved: true,
        isActive: true,
        date: { $gte: periodStart, $lte: periodEnd },
    })
        .toArray();
    // Query pending EODs (submitted but not yet approved)
    const pendingEodCount = await eodReports.countDocuments({
        staffId,
        businessId,
        isApproved: false,
        isActive: true,
        status: { $in: ["submitted", "needs_revision"] },
        date: { $gte: periodStart, $lte: periodEnd },
    });
    const totalHoursWorked = approvedEods.reduce((sum, record) => sum + (record.hoursWorked || 0), 0);
    const uniqueDates = new Set(approvedEods.map((r) => r.date));
    const totalDaysWorked = uniqueDates.size;
    const compensation = await resolveHourlyCompensationProfile(db, staffMember, periodEnd);
    const financials = calculateInvoiceFinancials(approvedEods, compensation, [], [], periodEnd);
    return {
        periodStart,
        periodEnd,
        totalHoursWorked: Math.round(totalHoursWorked * 100) / 100,
        totalDaysWorked,
        baseSalary: compensation.hourlyRate,
        salaryType: "hourly",
        estimatedPay: financials.netPay,
        approvedEodCount: approvedEods.length,
        pendingEodCount,
        nextPayoutDate,
    };
}
// Submit EOD Report (staff only)
export async function submitEod(request, reply) {
    const eodReports = request.server.mongo.db?.collection("eod_reports");
    const staff = request.server.mongo.db?.collection("staff");
    if (!eodReports || !staff) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const { id: staffId, businessId } = request.user;
    if (!staffId || !businessId) {
        return reply.status(400).send({ error: "Invalid staff token" });
    }
    // Verify staff exists and is active
    const staffMember = await staff.findOne({
        _id: new ObjectId(staffId),
        isActive: true,
        status: "active",
    });
    if (!staffMember) {
        return reply
            .status(404)
            .send({ error: "Staff member not found or inactive" });
    }
    const parseResult = submitEodSchema.safeParse(request.body);
    if (!parseResult.success) {
        return reply.status(400).send({
            error: "Validation failed",
            details: parseResult.error.errors,
        });
    }
    const { date, hoursWorked, regularHoursWorked, overtimeHoursWorked, nightDifferentialHours, tasksCompleted, onSite, challenges, nextDayPlan, notes, } = parseResult.data;
    // Enforce one EOD per staff per day
    const existingEod = await eodReports.findOne({
        staffId,
        businessId,
        date,
        isActive: true,
    });
    if (existingEod) {
        return reply.status(409).send({
            error: "Duplicate EOD report",
            message: `An EOD report already exists for ${date}. You can only submit one EOD per day.`,
            existingId: existingEod._id,
        });
    }
    const now = new Date().toISOString();
    const newEod = {
        staffId,
        businessId,
        date,
        hoursWorked,
        regularHoursWorked,
        overtimeHoursWorked,
        nightDifferentialHours,
        tasksCompleted,
        onSite,
        challenges,
        nextDayPlan,
        notes,
        status: "submitted",
        isApproved: false,
        isActive: true,
        createdAt: now,
        updatedAt: now,
    };
    const result = await eodReports.insertOne(newEod);
    return reply.status(201).send({
        _id: result.insertedId,
        ...newEod,
        message: "EOD report submitted successfully",
    });
}
// Edit own EOD (staff only — only when status is 'needs_revision')
export async function editOwnEod(request, reply) {
    const eodReports = request.server.mongo.db?.collection("eod_reports");
    if (!eodReports) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const { id: staffId, businessId } = request.user;
    const { id } = request.params;
    if (!staffId || !businessId) {
        return reply.status(400).send({ error: "Invalid staff token" });
    }
    if (!ObjectId.isValid(id)) {
        return reply.status(400).send({ error: "Invalid EOD report ID format" });
    }
    const parseResult = editOwnEodSchema.safeParse(request.body);
    if (!parseResult.success) {
        return reply.status(400).send({
            error: "Validation failed",
            details: parseResult.error.errors,
        });
    }
    // Find the EOD — must belong to this staff member
    const existingEod = await eodReports.findOne({
        _id: new ObjectId(id),
        staffId,
        businessId,
        isActive: true,
    });
    if (!existingEod) {
        return reply.status(404).send({ error: "EOD report not found" });
    }
    // Staff can only edit their own EOD if it's in 'needs_revision' status
    if (existingEod.status !== "needs_revision") {
        return reply.status(403).send({
            error: "Cannot edit",
            message: "You can only edit an EOD report that has been returned for revision",
        });
    }
    const updateData = {
        ...parseResult.data,
        status: "submitted", // Reset to submitted after staff edits
        updatedAt: new Date().toISOString(),
    };
    const result = await eodReports.findOneAndUpdate({ _id: new ObjectId(id) }, { $set: updateData }, { returnDocument: "after" });
    return {
        ...result,
        message: "EOD report updated and resubmitted successfully",
    };
}
// Get my EOD reports (staff only)
export async function getMyEodReports(request, reply) {
    const eodReports = request.server.mongo.db?.collection("eod_reports");
    if (!eodReports) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const { id: staffId, businessId } = request.user;
    if (!staffId || !businessId) {
        return reply.status(400).send({ error: "Invalid staff token" });
    }
    const query = {
        staffId,
        businessId,
        isActive: true,
    };
    // Filter by date range if provided
    if (request.query.startDate || request.query.endDate) {
        query.date = {};
        if (request.query.startDate) {
            query.date.$gte = request.query.startDate;
        }
        if (request.query.endDate) {
            query.date.$lte = request.query.endDate;
        }
    }
    // Filter by status if provided
    if (request.query.status) {
        query.status = request.query.status;
    }
    // Pagination
    const page = Math.max(1, parseInt(request.query.page || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(request.query.limit || "20", 10)));
    const skip = (page - 1) * limit;
    const [data, totalCount] = await Promise.all([
        eodReports.find(query).sort({ date: -1 }).skip(skip).limit(limit).toArray(),
        eodReports.countDocuments(query),
    ]);
    const totalPages = Math.ceil(totalCount / limit);
    return {
        data,
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
// Get single EOD report (staff only — own report)
export async function getMyEodById(request, reply) {
    const eodReports = request.server.mongo.db?.collection("eod_reports");
    if (!eodReports) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const { id: staffId, businessId } = request.user;
    const { id } = request.params;
    if (!staffId || !businessId) {
        return reply.status(400).send({ error: "Invalid staff token" });
    }
    if (!ObjectId.isValid(id)) {
        return reply.status(400).send({ error: "Invalid EOD report ID format" });
    }
    const eod = await eodReports.findOne({
        _id: new ObjectId(id),
        staffId,
        businessId,
        isActive: true,
    });
    if (!eod) {
        return reply.status(404).send({ error: "EOD report not found" });
    }
    return eod;
}
// ==================== ADMIN ACTIONS ====================
// Get all EOD reports (admin only — filtered by business access)
export async function getAllEodReports(request, reply) {
    const eodReports = request.server.mongo.db?.collection("eod_reports");
    const businesses = request.server.mongo.db?.collection("businesses");
    if (!eodReports || !businesses) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const query = { isActive: true };
    // Filter by business if provided
    if (request.query.businessId) {
        if (!ObjectId.isValid(request.query.businessId)) {
            return reply.status(400).send({ error: "Invalid business ID format" });
        }
        query.businessId = request.query.businessId;
    }
    // Filter by staff if provided
    if (request.query.staffId) {
        query.staffId = request.query.staffId;
    }
    // Filter by status if provided
    if (request.query.status) {
        query.status = request.query.status;
    }
    // Filter by approval status if provided
    if (request.query.isApproved !== undefined) {
        query.isApproved = request.query.isApproved === "true";
    }
    // Filter by date range
    if (request.query.startDate || request.query.endDate) {
        query.date = {};
        if (request.query.startDate) {
            query.date.$gte = request.query.startDate;
        }
        if (request.query.endDate) {
            query.date.$lte = request.query.endDate;
        }
    }
    // If not super-admin, filter by accessible businesses
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
    const result = await eodReports.find(query).sort({ date: -1 }).toArray();
    return result;
}
// Get EOD reports by business (admin only) — with pagination, filters & search
export async function getEodByBusiness(request, reply) {
    const eodReports = request.server.mongo.db?.collection("eod_reports");
    const businesses = request.server.mongo.db?.collection("businesses");
    const staffCollection = request.server.mongo.db?.collection("staff");
    if (!eodReports || !businesses || !staffCollection) {
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
    const limit = Math.min(100, Math.max(1, parseInt(request.query.limit || "20", 10)));
    const skip = (page - 1) * limit;
    const query = { businessId, isActive: true };
    // Status filter
    if (request.query.status) {
        query.status = request.query.status;
    }
    // Approval filter
    if (request.query.isApproved !== undefined) {
        query.isApproved = request.query.isApproved === "true";
    }
    // Date range filter
    if (request.query.startDate || request.query.endDate) {
        query.date = {};
        if (request.query.startDate) {
            query.date.$gte = request.query.startDate;
        }
        if (request.query.endDate) {
            query.date.$lte = request.query.endDate;
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
    // Use aggregation pipeline with $lookup to join staff details
    const pipeline = [
        { $match: query },
        { $sort: { date: -1, createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
            $addFields: {
                staffObjectId: {
                    $cond: {
                        if: { $ne: [{ $type: "$staffId" }, "missing"] },
                        then: { $toObjectId: "$staffId" },
                        else: null,
                    },
                },
            },
        },
        {
            $lookup: {
                from: "staff",
                localField: "staffObjectId",
                foreignField: "_id",
                as: "staffInfo",
            },
        },
        {
            $addFields: {
                staffName: {
                    $cond: {
                        if: { $gt: [{ $size: "$staffInfo" }, 0] },
                        then: {
                            $concat: [
                                { $arrayElemAt: ["$staffInfo.firstName", 0] },
                                " ",
                                { $arrayElemAt: ["$staffInfo.lastName", 0] },
                            ],
                        },
                        else: "Unknown",
                    },
                },
                staffEmail: {
                    $ifNull: [{ $arrayElemAt: ["$staffInfo.email", 0] }, null],
                },
            },
        },
        {
            $project: {
                staffInfo: 0,
                staffObjectId: 0,
            },
        },
    ];
    const [result, totalCount] = await Promise.all([
        eodReports.aggregate(pipeline).toArray(),
        eodReports.countDocuments(query),
    ]);
    const totalPages = Math.ceil(totalCount / limit);
    return {
        data: result,
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
// Get EOD reports by staff (admin only)
export async function getEodByStaff(request, reply) {
    const eodReports = request.server.mongo.db?.collection("eod_reports");
    const staff = request.server.mongo.db?.collection("staff");
    const businesses = request.server.mongo.db?.collection("businesses");
    if (!eodReports || !staff || !businesses) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const { staffId } = request.params;
    if (!ObjectId.isValid(staffId)) {
        return reply.status(400).send({ error: "Invalid staff ID format" });
    }
    // Get staff to check business access
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
    const query = { staffId, isActive: true };
    if (request.query.status) {
        query.status = request.query.status;
    }
    if (request.query.isApproved !== undefined) {
        query.isApproved = request.query.isApproved === "true";
    }
    if (request.query.startDate || request.query.endDate) {
        query.date = {};
        if (request.query.startDate) {
            query.date.$gte = request.query.startDate;
        }
        if (request.query.endDate) {
            query.date.$lte = request.query.endDate;
        }
    }
    const result = await eodReports.find(query).sort({ date: -1 }).toArray();
    return result;
}
// Get single EOD report by ID (admin only)
export async function getEodById(request, reply) {
    const eodReports = request.server.mongo.db?.collection("eod_reports");
    const businesses = request.server.mongo.db?.collection("businesses");
    if (!eodReports || !businesses) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const { id } = request.params;
    if (!ObjectId.isValid(id)) {
        return reply.status(400).send({ error: "Invalid EOD report ID format" });
    }
    const eod = await eodReports.findOne({
        _id: new ObjectId(id),
        isActive: true,
    });
    if (!eod) {
        return reply.status(404).send({ error: "EOD report not found" });
    }
    // Check business access (unless super-admin)
    if (request.user.role !== "super-admin") {
        const business = await businesses.findOne({
            _id: new ObjectId(eod.businessId),
            adminIds: request.user.id,
        });
        if (!business) {
            return reply.status(403).send({
                error: "Forbidden",
                message: "You do not have access to this EOD report's business",
            });
        }
    }
    return eod;
}
// Review EOD report (admin only — approve or return for revision)
export async function reviewEod(request, reply) {
    const eodReports = request.server.mongo.db?.collection("eod_reports");
    const businesses = request.server.mongo.db?.collection("businesses");
    if (!eodReports || !businesses) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const { id } = request.params;
    if (!ObjectId.isValid(id)) {
        return reply.status(400).send({ error: "Invalid EOD report ID format" });
    }
    const parseResult = reviewEodSchema.safeParse(request.body);
    if (!parseResult.success) {
        return reply.status(400).send({
            error: "Validation failed",
            details: parseResult.error.errors,
        });
    }
    // Get EOD report
    const existingEod = await eodReports.findOne({
        _id: new ObjectId(id),
        isActive: true,
    });
    if (!existingEod) {
        return reply.status(404).send({ error: "EOD report not found" });
    }
    // Check business access (unless super-admin)
    if (request.user.role !== "super-admin") {
        const business = await businesses.findOne({
            _id: new ObjectId(existingEod.businessId),
            adminIds: request.user.id,
        });
        if (!business) {
            return reply.status(403).send({
                error: "Forbidden",
                message: "You do not have access to this EOD report's business",
            });
        }
    }
    const { status, isApproved, adminNotes } = parseResult.data;
    const now = new Date().toISOString();
    const updateData = {
        status,
        adminNotes,
        reviewedBy: request.user.id,
        reviewedAt: now,
        updatedAt: now,
    };
    // If status is 'reviewed', auto-approve unless explicitly set to false
    if (status === "reviewed") {
        updateData.isApproved = isApproved !== undefined ? isApproved : true;
    }
    // If status is 'needs_revision', ensure not approved
    if (status === "needs_revision") {
        updateData.isApproved = false;
    }
    const result = await eodReports.findOneAndUpdate({ _id: new ObjectId(id) }, { $set: updateData }, { returnDocument: "after" });
    // Auto-invoice: trigger when approval status changes
    const wasApproved = existingEod.isApproved === true;
    const nowApproved = updateData.isApproved === true;
    if (nowApproved || (wasApproved && !nowApproved)) {
        try {
            const db = request.server.mongo.db;
            if (db) {
                const staffCollection = db.collection("staff");
                const staffMember = await staffCollection.findOne({
                    _id: new ObjectId(existingEod.staffId),
                    isActive: true,
                });
                if (staffMember) {
                    await invoiceOnEodApproval(db, result, staffMember);
                }
            }
        }
        catch (err) {
            request.server.log.error(err, `[AUTO-INVOICE] Failed to update invoice after EOD review (eodId: ${id})`);
        }
    }
    const action = status === "reviewed" ? "reviewed" : "returned for revision";
    return {
        ...result,
        message: `EOD report ${action} successfully`,
    };
}
// Admin edit EOD report (minor tweaks — e.g., adjust hours)
export async function adminEditEod(request, reply) {
    const eodReports = request.server.mongo.db?.collection("eod_reports");
    const businesses = request.server.mongo.db?.collection("businesses");
    if (!eodReports || !businesses) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const { id } = request.params;
    if (!ObjectId.isValid(id)) {
        return reply.status(400).send({ error: "Invalid EOD report ID format" });
    }
    const parseResult = adminEditEodSchema.safeParse(request.body);
    if (!parseResult.success) {
        return reply.status(400).send({
            error: "Validation failed",
            details: parseResult.error.errors,
        });
    }
    // Get EOD report
    const existingEod = await eodReports.findOne({
        _id: new ObjectId(id),
        isActive: true,
    });
    if (!existingEod) {
        return reply.status(404).send({ error: "EOD report not found" });
    }
    // Check business access (unless super-admin)
    if (request.user.role !== "super-admin") {
        const business = await businesses.findOne({
            _id: new ObjectId(existingEod.businessId),
            adminIds: request.user.id,
        });
        if (!business) {
            return reply.status(403).send({
                error: "Forbidden",
                message: "You do not have access to this EOD report's business",
            });
        }
    }
    // If date is being changed, check for duplicates
    if (parseResult.data.date && parseResult.data.date !== existingEod.date) {
        const duplicate = await eodReports.findOne({
            staffId: existingEod.staffId,
            businessId: existingEod.businessId,
            date: parseResult.data.date,
            _id: { $ne: new ObjectId(id) },
            isActive: true,
        });
        if (duplicate) {
            return reply.status(409).send({
                error: "Duplicate date",
                message: `An EOD report already exists for ${parseResult.data.date}`,
            });
        }
    }
    const updateData = {
        ...parseResult.data,
        updatedAt: new Date().toISOString(),
    };
    const result = await eodReports.findOneAndUpdate({ _id: new ObjectId(id) }, { $set: updateData }, { returnDocument: "after" });
    // Auto-invoice: trigger when approval status changes via direct edit
    const wasApproved = existingEod.isApproved === true;
    const nowApproved = result?.isApproved === true;
    if (wasApproved !== nowApproved) {
        try {
            const db = request.server.mongo.db;
            if (db) {
                const staffCollection = db.collection("staff");
                const staffMember = await staffCollection.findOne({
                    _id: new ObjectId(existingEod.staffId),
                    isActive: true,
                });
                if (staffMember) {
                    await invoiceOnEodApproval(db, result, staffMember);
                }
            }
        }
        catch (err) {
            request.server.log.error(err, `[AUTO-INVOICE] Failed to update invoice after EOD edit (eodId: ${id})`);
        }
    }
    return result;
}
// Delete EOD report (soft delete — admin only)
export async function deleteEod(request, reply) {
    const eodReports = request.server.mongo.db?.collection("eod_reports");
    const businesses = request.server.mongo.db?.collection("businesses");
    if (!eodReports || !businesses) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const { id } = request.params;
    if (!ObjectId.isValid(id)) {
        return reply.status(400).send({ error: "Invalid EOD report ID format" });
    }
    // Get EOD report
    const existingEod = await eodReports.findOne({ _id: new ObjectId(id) });
    if (!existingEod) {
        return reply.status(404).send({ error: "EOD report not found" });
    }
    // Check business access (unless super-admin)
    if (request.user.role !== "super-admin") {
        const business = await businesses.findOne({
            _id: new ObjectId(existingEod.businessId),
            adminIds: request.user.id,
        });
        if (!business) {
            return reply.status(403).send({
                error: "Forbidden",
                message: "You do not have access to this EOD report's business",
            });
        }
    }
    await eodReports.findOneAndUpdate({ _id: new ObjectId(id) }, { $set: { isActive: false, updatedAt: new Date().toISOString() } });
    return { message: "EOD report deleted successfully" };
}
//# sourceMappingURL=eod.controllers.js.map