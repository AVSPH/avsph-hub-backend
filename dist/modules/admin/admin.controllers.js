import { ObjectId } from "@fastify/mongodb";
import bcrypt from "bcrypt";
import { createAdminSchema, loginSchema, updateAdminSchema, } from "../../types/admin.types.js";
import { getAdminCreationEmail } from "../../utils/emails/auth/admin.creation.email.js";
// Login admin
export async function loginAdmin(request, reply) {
    const admins = request.server.mongo.db?.collection("admins");
    if (!admins) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const parseResult = loginSchema.safeParse(request.body);
    if (!parseResult.success) {
        return reply.status(400).send({
            error: "Validation failed",
            details: parseResult.error.errors,
        });
    }
    const { email, password } = parseResult.data;
    const admin = await admins.findOne({ email, isActive: true });
    if (!admin) {
        return reply.status(401).send({ error: "Invalid email or password" });
    }
    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
        return reply.status(401).send({ error: "Invalid email or password" });
    }
    const token = request.server.jwt.sign({
        id: admin._id.toString(),
        email: admin.email,
        role: admin.role,
    });
    const { password: _, ...adminWithoutPassword } = admin;
    return {
        token,
        admin: {
            ...adminWithoutPassword,
            _id: admin._id.toString(),
        },
    };
}
// Get current admin
export async function getCurrentAdmin(request, reply) {
    const admins = request.server.mongo.db?.collection("admins");
    if (!admins) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const { id } = request.user;
    if (!ObjectId.isValid(id)) {
        return reply.status(400).send({ error: "Invalid admin ID" });
    }
    const admin = await admins.findOne({ _id: new ObjectId(id) });
    if (!admin) {
        return reply.status(404).send({ error: "Admin not found" });
    }
    const { password, ...adminWithoutPassword } = admin;
    return adminWithoutPassword;
}
// Create admin (for initial setup)
export async function createAdmin(request, reply) {
    const admins = request.server.mongo.db?.collection("admins");
    if (!admins) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const parseResult = createAdminSchema.safeParse(request.body);
    if (!parseResult.success) {
        return reply.status(400).send({
            error: "Validation failed",
            details: parseResult.error.errors,
        });
    }
    const { email, password, firstName, lastName } = parseResult.data;
    // Check if email already exists
    const existingAdmin = await admins.findOne({ email });
    if (existingAdmin) {
        return reply.status(409).send({ error: "Email already exists" });
    }
    // Check if this is the first admin (auto-promote to super-admin)
    const adminCount = await admins.countDocuments();
    const isFirstAdmin = adminCount === 0;
    const hashedPassword = await bcrypt.hash(password, 10);
    const now = new Date().toISOString();
    const assignedBusinessIds = parseResult.data.businessIds || [];
    const newAdmin = {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: isFirstAdmin
            ? "super-admin"
            : parseResult.data.role || "admin",
        businessIds: assignedBusinessIds,
        isActive: true,
        createdAt: now,
        updatedAt: now,
    };
    const result = await admins.insertOne(newAdmin);
    const newAdminId = result.insertedId.toString();
    // Update business adminIds arrays for assigned businesses
    if (assignedBusinessIds.length > 0) {
        const businesses = request.server.mongo.db?.collection("businesses");
        if (businesses) {
            await businesses.updateMany({ _id: { $in: assignedBusinessIds.map((id) => new ObjectId(id)) } }, { $addToSet: { adminIds: newAdminId } });
        }
    }
    // Send welcome email to the new admin
    try {
        const adminRole = isFirstAdmin ? "Super Admin" : (parseResult.data.role || "Admin");
        const emailHtml = getAdminCreationEmail(firstName, email, password, // original plain-text password before hashing
        adminRole);
        await request.server.gmail.sendEmail({
            to: email,
            subject: `Welcome to Advanced Virtual Staff! Your Admin Account is Ready!`,
            body: emailHtml,
        });
        request.server.log.info(`Admin creation welcome email sent to ${email}`);
    }
    catch (emailError) {
        // Log the error but don't fail the admin creation
        request.server.log.error(emailError, `Failed to send admin creation email to ${email}`);
    }
    const { password: _, ...responseAdmin } = newAdmin;
    return reply.status(201).send({
        _id: result.insertedId,
        ...responseAdmin,
    });
}
// Get all admins (super-admin only)
export async function getAllAdmins(request, reply) {
    const admins = request.server.mongo.db?.collection("admins");
    if (!admins) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const result = await admins.find({ isActive: true }).toArray();
    // Remove passwords from results
    return result.map((admin) => {
        const { password, ...adminWithoutPassword } = admin;
        return {
            ...adminWithoutPassword,
            _id: admin._id.toString(),
        };
    });
}
// Get admin by ID (super-admin only)
export async function getAdminById(request, reply) {
    const admins = request.server.mongo.db?.collection("admins");
    if (!admins) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const { id } = request.params;
    if (!ObjectId.isValid(id)) {
        return reply.status(400).send({ error: "Invalid admin ID format" });
    }
    const admin = await admins.findOne({ _id: new ObjectId(id) });
    if (!admin) {
        return reply.status(404).send({ error: "Admin not found" });
    }
    const { password, ...adminWithoutPassword } = admin;
    return {
        ...adminWithoutPassword,
        _id: admin._id.toString(),
    };
}
// Update admin (super-admin only)
export async function updateAdmin(request, reply) {
    const admins = request.server.mongo.db?.collection("admins");
    if (!admins) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const { id } = request.params;
    if (!ObjectId.isValid(id)) {
        return reply.status(400).send({ error: "Invalid admin ID format" });
    }
    const parseResult = updateAdminSchema.safeParse(request.body);
    if (!parseResult.success) {
        return reply.status(400).send({
            error: "Validation failed",
            details: parseResult.error.errors,
        });
    }
    // Check if email is being updated and if it already exists
    if (parseResult.data.email) {
        const existingAdmin = await admins.findOne({
            email: parseResult.data.email,
            _id: { $ne: new ObjectId(id) },
        });
        if (existingAdmin) {
            return reply.status(409).send({ error: "Email already exists" });
        }
    }
    // Validate businessIds if provided
    if (parseResult.data.businessIds && parseResult.data.businessIds.length > 0) {
        const businesses = request.server.mongo.db?.collection("businesses");
        if (businesses) {
            const validBusinesses = await businesses.countDocuments({
                _id: {
                    $in: parseResult.data.businessIds.map((id) => new ObjectId(id)),
                },
            });
            if (validBusinesses !== parseResult.data.businessIds.length) {
                return reply
                    .status(400)
                    .send({ error: "One or more business IDs are invalid" });
            }
        }
    }
    // Get current admin to compare businessIds changes
    const currentAdmin = await admins.findOne({ _id: new ObjectId(id) });
    if (!currentAdmin) {
        return reply.status(404).send({ error: "Admin not found" });
    }
    // Update business adminIds arrays if businessIds changed
    if (parseResult.data.businessIds !== undefined) {
        const businesses = request.server.mongo.db?.collection("businesses");
        if (businesses) {
            const oldBusinessIds = currentAdmin.businessIds || [];
            const newBusinessIds = parseResult.data.businessIds || [];
            // Remove admin from businesses they no longer have access to
            const removedBusinessIds = oldBusinessIds.filter((bid) => !newBusinessIds.includes(bid));
            if (removedBusinessIds.length > 0) {
                await businesses.updateMany({
                    _id: {
                        $in: removedBusinessIds.map((bid) => new ObjectId(bid)),
                    },
                }, { $pull: { adminIds: id } });
            }
            // Add admin to newly assigned businesses
            const addedBusinessIds = newBusinessIds.filter((bid) => !oldBusinessIds.includes(bid));
            if (addedBusinessIds.length > 0) {
                await businesses.updateMany({
                    _id: {
                        $in: addedBusinessIds.map((bid) => new ObjectId(bid)),
                    },
                }, { $addToSet: { adminIds: id } });
            }
        }
    }
    const now = new Date().toISOString();
    const updateData = {
        ...parseResult.data,
        updatedAt: now,
    };
    const result = await admins.findOneAndUpdate({ _id: new ObjectId(id) }, { $set: updateData }, { returnDocument: "after" });
    if (!result) {
        return reply.status(404).send({ error: "Admin not found" });
    }
    const { password, ...adminWithoutPassword } = result;
    return {
        ...adminWithoutPassword,
        _id: result._id.toString(),
    };
}
// Delete admin (soft delete, super-admin only)
export async function deleteAdmin(request, reply) {
    const admins = request.server.mongo.db?.collection("admins");
    if (!admins) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const { id } = request.params;
    if (!ObjectId.isValid(id)) {
        return reply.status(400).send({ error: "Invalid admin ID format" });
    }
    // Prevent deleting yourself
    if (id === request.user.id) {
        return reply
            .status(400)
            .send({ error: "You cannot delete your own account" });
    }
    const now = new Date().toISOString();
    const result = await admins.findOneAndUpdate({ _id: new ObjectId(id) }, { $set: { isActive: false, updatedAt: now } }, { returnDocument: "after" });
    if (!result) {
        return reply.status(404).send({ error: "Admin not found" });
    }
    return { message: "Admin deleted successfully" };
}
//# sourceMappingURL=admin.controllers.js.map