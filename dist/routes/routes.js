import userRoutes from "../modules/user/user.routes.js";
import adminRoutes from "../modules/admin/admin.routes.js";
import authAdminRoutes from "../modules/admin/auth/auth.admin.routes.js";
import businessRoutes from "../modules/business/business.routes.js";
import blogRoutes from "../modules/blog/blog.routes.js";
import applicantRoutes from "../modules/applicant/applicant.routes.js";
import staffRoutes from "../modules/staff/staff.routes.js";
import staffAuthRoutes from "../modules/staff/staff.auth.routes.js";
import attendanceRoutes from "../modules/attendance/attendance.routes.js";
import payrollRoutes from "../modules/payroll/payroll.routes.js";
import bookingRoutes from "../modules/booking/booking.routes.js";
import commentRoutes from "../modules/comment/comment.routes.js";
import eodRoutes from "../modules/eod/eod.routes.js";
import adminInvoiceRoutes from "../modules/invoice/admin.invoice.route.js";
import staffInvoiceRoutes from "../modules/invoice/staff.invoice.route.js";
import gmailRoutes from "../modules/gmail/gmail.routes.js";
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
    // Applicant routes
    await fastify.register(applicantRoutes);
    // Staff routes
    await fastify.register(staffRoutes);
    // Staff auth routes
    await fastify.register(staffAuthRoutes);
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
    // Gmail routes (test)
    await fastify.register(gmailRoutes);
};
export default routes;
//# sourceMappingURL=routes.js.map