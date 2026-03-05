import type { FastifyRequest, FastifyReply } from "fastify";
import { ObjectId } from "@fastify/mongodb";

interface IdParams {
  id: string;
}

// ==================== STAFF INVOICE ACTIONS ====================

// Get my invoices (staff only — only approved or paid invoices)
export async function getMyInvoices(
  request: FastifyRequest<{
    Querystring: {
      status?: string;
      startDate?: string;
      endDate?: string;
    };
  }>,
  reply: FastifyReply,
) {
  const db = request.server.mongo.db;
  const invoices = db?.collection("invoices");

  if (!db || !invoices) {
    return reply.status(500).send({ error: "Database not available" });
  }

  const { id: staffId, businessId } = request.user;

  if (!staffId || !businessId) {
    return reply.status(400).send({ error: "Invalid staff token" });
  }

  const allowedStatuses = ["draft", "calculated", "approved", "paid"];

  const query: any = {
    staffId,
    businessId,
    isActive: true,
    status: { $in: allowedStatuses },
  };

  // If a specific status filter is provided, validate it
  if (request.query.status) {
    if (!allowedStatuses.includes(request.query.status)) {
      return reply.status(400).send({
        error: "Invalid status filter",
        message: `Allowed statuses: ${allowedStatuses.join(", ")}`,
      });
    }
    query.status = request.query.status;
  }

  // Date range filter
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

// Get a single invoice by ID (staff only — own invoice, approved or paid)
export async function getMyInvoiceById(
  request: FastifyRequest<{ Params: IdParams }>,
  reply: FastifyReply,
) {
  const db = request.server.mongo.db;
  const invoices = db?.collection("invoices");
  const eodReports = db?.collection("eod_reports");

  if (!db || !invoices || !eodReports) {
    return reply.status(500).send({ error: "Database not available" });
  }

  const { id: staffId, businessId } = request.user;
  const { id } = request.params;

  if (!staffId || !businessId) {
    return reply.status(400).send({ error: "Invalid staff token" });
  }

  if (!ObjectId.isValid(id)) {
    return reply.status(400).send({ error: "Invalid invoice ID format" });
  }

  const invoice = await invoices.findOne({
    _id: new ObjectId(id),
    staffId,
    businessId,
    isActive: true,
    status: { $in: ["draft", "calculated", "approved", "paid"] },
  });

  if (!invoice) {
    return reply.status(404).send({ error: "Invoice not found" });
  }

  // Fetch linked EOD reports for breakdown
  const linkedEods =
    invoice.eodIds && invoice.eodIds.length > 0
      ? await eodReports
          .find({
            _id: {
              $in: invoice.eodIds.map((eid: string) => new ObjectId(eid)),
            },
          })
          .project({
            _id: 1,
            date: 1,
            hoursWorked: 1,
            tasksCompleted: 1,
            status: 1,
            isApproved: 1,
          })
          .sort({ date: 1 })
          .toArray()
      : [];

  return {
    ...invoice,
    eodReports: linkedEods,
  };
}
