import type { FastifyReply, FastifyRequest } from "fastify";
import { ObjectId } from "@fastify/mongodb";

interface BusinessIdParams {
  businessId: string;
}

interface RecentQuery {
  limit?: string;
}

const DEFAULT_RECENT_LIMIT = 5;
const MAX_RECENT_LIMIT = 20;

function parseLimit(rawLimit?: string): number {
  const parsed = Number.parseInt(rawLimit || "", 10);

  if (Number.isNaN(parsed)) {
    return DEFAULT_RECENT_LIMIT;
  }

  return Math.min(MAX_RECENT_LIMIT, Math.max(1, parsed));
}

async function ensureBusinessAccess(
  request: FastifyRequest,
  reply: FastifyReply,
  businessId: string,
): Promise<boolean> {
  const businesses = request.server.mongo.db?.collection("businesses");

  if (!businesses) {
    reply.status(500).send({ error: "Database not available" });
    return false;
  }

  if (!ObjectId.isValid(businessId)) {
    reply.status(400).send({ error: "Invalid business ID format" });
    return false;
  }

  if (request.user.role === "super-admin") {
    return true;
  }

  const business = await businesses.findOne({
    _id: new ObjectId(businessId),
    adminIds: request.user.id,
    isActive: true,
  });

  if (!business) {
    reply.status(403).send({
      error: "Forbidden",
      message: "You do not have access to this business",
    });
    return false;
  }

  return true;
}

export async function getBusinessOverviewStats(
  request: FastifyRequest<{ Params: BusinessIdParams }>,
  reply: FastifyReply,
) {
  const db = request.server.mongo.db;
  const staff = db?.collection("staff");
  const jobPosts = db?.collection("jobPosts");
  const eodReports = db?.collection("eod_reports");

  if (!db || !staff || !jobPosts || !eodReports) {
    return reply.status(500).send({ error: "Database not available" });
  }

  const { businessId } = request.params;
  const canAccess = await ensureBusinessAccess(request, reply, businessId);

  if (!canAccess) {
    return;
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const sevenDaysAgoDate = sevenDaysAgo.toISOString().split("T")[0];

  const [totalStaff, openPositions, recentEods7d, pendingEodApprovals] =
    await Promise.all([
      staff.countDocuments({
        businessId,
        isActive: true,
      }),
      jobPosts.countDocuments({
        businessId,
        isActive: true,
        status: "open",
      }),
      eodReports.countDocuments({
        businessId,
        isActive: true,
        date: { $gte: sevenDaysAgoDate },
      }),
      eodReports.countDocuments({
        businessId,
        isActive: true,
        status: "submitted",
        isApproved: false,
      }),
    ]);

  return {
    businessId,
    totalStaff,
    openPositions,
    recentEods7d,
    pendingEodApprovals,
    updatedAt: new Date().toISOString(),
  };
}

export async function getRecentBusinessInvoices(
  request: FastifyRequest<{
    Params: BusinessIdParams;
    Querystring: RecentQuery;
  }>,
  reply: FastifyReply,
) {
  const db = request.server.mongo.db;
  const invoices = db?.collection("invoices");

  if (!db || !invoices) {
    return reply.status(500).send({ error: "Database not available" });
  }

  const { businessId } = request.params;
  const canAccess = await ensureBusinessAccess(request, reply, businessId);

  if (!canAccess) {
    return;
  }

  const limit = parseLimit(request.query.limit);

  const data = await invoices
    .find({
      businessId,
      isActive: true,
    })
    .project({
      _id: 1,
      staffId: 1,
      staffName: 1,
      staffEmail: 1,
      periodStart: 1,
      periodEnd: 1,
      status: 1,
      netPay: 1,
      currency: 1,
      createdAt: 1,
    })
    .sort({ periodStart: -1, createdAt: -1 })
    .limit(limit)
    .toArray();

  return {
    data,
    total: data.length,
    limit,
  };
}

export async function getRecentBusinessEods(
  request: FastifyRequest<{
    Params: BusinessIdParams;
    Querystring: RecentQuery;
  }>,
  reply: FastifyReply,
) {
  const db = request.server.mongo.db;
  const eodReports = db?.collection("eod_reports");

  if (!db || !eodReports) {
    return reply.status(500).send({ error: "Database not available" });
  }

  const { businessId } = request.params;
  const canAccess = await ensureBusinessAccess(request, reply, businessId);

  if (!canAccess) {
    return;
  }

  const limit = parseLimit(request.query.limit);

  const pipeline: any[] = [
    {
      $match: {
        businessId,
        isActive: true,
      },
    },
    {
      $sort: {
        date: -1,
        createdAt: -1,
      },
    },
    {
      $limit: limit,
    },
    {
      $addFields: {
        staffObjectId: {
          $convert: {
            input: "$staffId",
            to: "objectId",
            onError: null,
            onNull: null,
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
        _id: 1,
        staffId: 1,
        staffName: 1,
        staffEmail: 1,
        date: 1,
        hoursWorked: 1,
        tasksCompleted: 1,
        status: 1,
        isApproved: 1,
        createdAt: 1,
      },
    },
  ];

  const data = await eodReports.aggregate(pipeline).toArray();

  return {
    data,
    total: data.length,
    limit,
  };
}
