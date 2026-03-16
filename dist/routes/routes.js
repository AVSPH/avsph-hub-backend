import userRoutes from "../modules/user/user.routes.js";
import adminRoutes from "../modules/admin/admin.routes.js";
import authAdminRoutes from "../modules/admin/auth/auth.admin.routes.js";
import businessRoutes from "../modules/business/business.routes.js";
import blogRoutes from "../modules/blog/blog.routes.js";
import applicantRoutes from "../modules/applicant/applicant.routes.js";
import jobPostRoutes from "../modules/job-post/jobPost.routes.js";
import staffRoutes from "../modules/staff/staff.management.route.js";
import staffAuthRoutes from "../modules/staff/staff.auth.routes.js";
import staffSelfRoutes from "../modules/staff/staff.route.js";
import attendanceRoutes from "../modules/attendance/attendance.routes.js";
import payrollRoutes from "../modules/payroll/payroll.routes.js";
import bookingRoutes from "../modules/booking/booking.routes.js";
import commentRoutes from "../modules/comment/comment.routes.js";
import eodRoutes from "../modules/eod/eod.routes.js";
import adminInvoiceRoutes from "../modules/invoice/admin.invoice.route.js";
import staffInvoiceRoutes from "../modules/invoice/staff.invoice.route.js";
import gmailRoutes from "../modules/gmail/gmail.routes.js";
import adminSettingsRoutes from "../modules/admin/admin-settings/admin.settings.route.js";
import compensationRoutes from "../modules/compensation/compensation.routes.js";
import exchangeRateRoutes from "../modules/exchange-rate/exchange-rate.routes.js";
import overviewRoutes from "../modules/overview/overview.routes.js";
// Central routes aggregator - register all module routes here
const routes = async (fastify) => {
    // Admin auth routes
    await fastify.register(adminRoutes);
    // Admin forgot/reset password routes
    await fastify.register(authAdminRoutes);
    // User/Staff routes
    await fastify.register(userRoutes);
    // Business routes
    await fastify.register(businessRoutes);
    // Blog routes
    await fastify.register(blogRoutes);
    // Job Post routes (admin CRUD + public listing/apply)
    await fastify.register(jobPostRoutes);
    // Applicant routes
    await fastify.register(applicantRoutes);
    // Staff routes
    await fastify.register(staffRoutes);
    // Staff auth routes
    await fastify.register(staffAuthRoutes);
    // Staff self-service routes (profile update, document upload)
    await fastify.register(staffSelfRoutes);
    // Attendance routes
    await fastify.register(attendanceRoutes);
    // Payroll routes
    await fastify.register(payrollRoutes);
    // Booking routes (public route for consultation requests)
    await fastify.register(bookingRoutes);
    // Comment routes (includes public comment submission)
    await fastify.register(commentRoutes);
    // EOD Report routes
    await fastify.register(eodRoutes);
    // Invoice routes (admin + staff)
    await fastify.register(adminInvoiceRoutes);
    await fastify.register(staffInvoiceRoutes);
    // Compensation profile routes
    await fastify.register(compensationRoutes);
    // Exchange rate routes
    await fastify.register(exchangeRateRoutes);
    // Business overview routes
    await fastify.register(overviewRoutes);
    // Admin settings routes (profile, email, password)
    await fastify.register(adminSettingsRoutes);
    // Gmail routes (test)
    await fastify.register(gmailRoutes);
};
export default routes;
//# sourceMappingURL=routes.js.map