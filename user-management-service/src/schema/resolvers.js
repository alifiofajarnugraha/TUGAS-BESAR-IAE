const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { generateToken, verifyToken } = require("../auth");
const { Op } = require("sequelize"); // ✅ Import Sequelize operators

module.exports = {
  Query: {
    getUser: async (_, { id }) => await User.findByPk(id),

    users: async () =>
      await User.findAll({
        order: [["id", "ASC"]],
      }),

    getCurrentUser: async (_, __, context) => {
      if (!context.user) {
        throw new Error("Authentication required");
      }

      try {
        const user = await User.findByPk(context.user.id);
        if (!user) {
          throw new Error("User not found");
        }
        return user;
      } catch (error) {
        throw new Error("Invalid token or user not found");
      }
    },

    // ✅ NEW: Get user statistics (admin only)
    getUserStats: async (_, __, context) => {
      if (!context.user || context.user.role !== "admin") {
        throw new Error("Admin access required");
      }

      try {
        const totalUsers = await User.count();
        const totalCustomers = await User.count({
          where: { role: "customer" },
        });
        const totalAgents = await User.count({ where: { role: "agent" } });
        const totalAdmins = await User.count({ where: { role: "admin" } });

        // Recent registrations (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentRegistrations = await User.count({
          where: {
            createdAt: {
              [Op.gte]: sevenDaysAgo,
            },
          },
        });

        return {
          totalUsers,
          totalCustomers,
          totalAgents,
          totalAdmins,
          recentRegistrations,
        };
      } catch (error) {
        console.error("Error getting user stats:", error);
        throw new Error("Failed to retrieve user statistics");
      }
    },

    // ✅ NEW: Get users by role (admin only)
    getUsersByRole: async (_, { role }, context) => {
      if (!context.user || context.user.role !== "admin") {
        throw new Error("Admin access required");
      }

      const allowedRoles = ["customer", "agent", "admin"];
      if (!allowedRoles.includes(role)) {
        throw new Error("Invalid role specified");
      }

      try {
        return await User.findAll({
          where: { role },
          order: [["createdAt", "DESC"]],
          limit: 100, // ✅ Limit for performance
        });
      } catch (error) {
        console.error("Error getting users by role:", error);
        throw new Error("Failed to retrieve users by role");
      }
    },

    // ✅ NEW: Search users (admin only)
    searchUsers: async (_, { query }, context) => {
      if (!context.user || context.user.role !== "admin") {
        throw new Error("Admin access required");
      }

      if (!query || query.trim().length < 2) {
        throw new Error("Search query must be at least 2 characters");
      }

      try {
        return await User.findAll({
          where: {
            [Op.or]: [
              { name: { [Op.iLike]: `%${query.trim()}%` } },
              { email: { [Op.iLike]: `%${query.trim()}%` } },
            ],
          },
          order: [["name", "ASC"]],
          limit: 50, // ✅ Limit results for performance
        });
      } catch (error) {
        console.error("Error searching users:", error);
        throw new Error("Failed to search users");
      }
    },
  },

  Mutation: {
    createUser: async (_, { input }, context) => {
      const allowedRoles = ["customer", "agent", "admin"];

      try {
        // ✅ EMAIL VALIDATION
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input.email)) {
          throw new Error("Format email tidak valid");
        }

        // ✅ PASSWORD STRENGTH CHECK
        if (input.password.length < 6) {
          throw new Error("Password minimal 6 karakter");
        }

        // ✅ CHECK IF EMAIL ALREADY EXISTS
        const existingUser = await User.findOne({
          where: { email: input.email },
        });
        if (existingUser) {
          throw new Error("Email sudah terdaftar");
        }

        // ✅ SECURITY FIX: Role-based authorization
        let role = input.role || "customer"; // ✅ Default to customer if not specified

        if (input.role) {
          // Validate role value
          if (!allowedRoles.includes(input.role)) {
            throw new Error("Role tidak valid. Pilih: customer, agent, admin");
          }

          // ✅ CRITICAL: Only admin can create admin/agent users
          if (input.role === "admin" || input.role === "agent") {
            if (!context.user || context.user.role !== "admin") {
              throw new Error(
                "Hanya admin yang dapat membuat user dengan role admin atau agent"
              );
            }
          }
        }

        // ✅ Always hash password for new users
        const hashed = await bcrypt.hash(input.password, 10);

        const user = await User.create({
          ...input,
          password: hashed,
          role,
        });

        // ✅ Log user creation for audit
        console.log(
          `👤 User created: ${user.email} (${user.role}) by ${
            context.user?.email || "system"
          }`
        );

        // ✅ Don't return password in response
        const { password: _, ...userWithoutPassword } = user.toJSON();
        return userWithoutPassword;
      } catch (error) {
        console.error("Error creating user:", error);
        throw error;
      }
    },

    updateUserProfile: async (_, { id, input }, context) => {
      try {
        // ✅ SECURITY FIX: Must be authenticated
        const currentUser = context.user;
        if (!currentUser) {
          throw new Error("Authentication required");
        }

        // ✅ Get target user
        const targetUser = await User.findByPk(id);
        if (!targetUser) {
          throw new Error("User tidak ditemukan");
        }

        // ✅ EMAIL VALIDATION (if updating email)
        if (input.email) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(input.email)) {
            throw new Error("Format email tidak valid");
          }

          // Check if email already exists (exclude current user)
          const existingUser = await User.findOne({
            where: {
              email: input.email,
              id: { [Op.ne]: id }, // ✅ Using imported Op
            },
          });
          if (existingUser) {
            throw new Error("Email sudah digunakan oleh user lain");
          }
        }

        // ✅ AUTHORIZATION CHECKS
        const isAdmin = currentUser.role === "admin";
        const isOwner = currentUser.id === parseInt(id);

        // Regular users can only update their own profile
        if (!isAdmin && !isOwner) {
          throw new Error("Anda hanya dapat mengubah profil sendiri");
        }

        // ✅ ROLE UPDATE RESTRICTIONS
        if (input.role) {
          // Only admin can change roles
          if (!isAdmin) {
            throw new Error("Hanya admin yang boleh mengubah role");
          }

          // Validate role value
          const allowedRoles = ["customer", "agent", "admin"];
          if (!allowedRoles.includes(input.role)) {
            throw new Error("Role tidak valid. Pilih: customer, agent, admin");
          }

          // ✅ PREVENT ADMIN SELF-DEMOTION
          if (
            isOwner &&
            currentUser.role === "admin" &&
            input.role !== "admin"
          ) {
            throw new Error("Admin tidak dapat menurunkan role diri sendiri");
          }

          // ✅ PREVENT LAST ADMIN DEMOTION
          if (targetUser.role === "admin" && input.role !== "admin") {
            const adminCount = await User.count({ where: { role: "admin" } });
            if (adminCount <= 1) {
              throw new Error("Tidak dapat menghapus admin terakhir");
            }
          }
        }

        // ✅ FILTER ALLOWED FIELDS based on role
        const allowedFields = isAdmin
          ? Object.keys(input) // Admin can update all fields
          : Object.keys(input).filter((field) => !["role"].includes(field)); // Regular users cannot update role

        const filteredInput = {};
        allowedFields.forEach((field) => {
          if (input[field] !== undefined) {
            filteredInput[field] = input[field];
          }
        });

        // ✅ HASH PASSWORD if being updated
        if (filteredInput.password) {
          if (filteredInput.password.length < 6) {
            throw new Error("Password minimal 6 karakter");
          }
          filteredInput.password = await bcrypt.hash(
            filteredInput.password,
            10
          );
        }

        await User.update(filteredInput, { where: { id } });
        const updatedUser = await User.findByPk(id);

        // ✅ Log profile update for audit
        console.log(
          `✏️ Profile updated: ${updatedUser.email} by ${currentUser.email}`
        );

        // ✅ Don't return password in response
        const { password: _, ...userWithoutPassword } = updatedUser.toJSON();
        return userWithoutPassword;
      } catch (error) {
        console.error("Error updating user profile:", error);
        throw error;
      }
    },

    authenticateUser: async (_, { email, password }) => {
      try {
        // ✅ INPUT VALIDATION
        if (!email || !password) {
          throw new Error("Email dan password harus diisi");
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
          throw new Error("Email atau password salah");
        }

        // ✅ Support both plain text (from init.sql) and hashed passwords
        let passwordValid = false;

        // Check if password is already hashed (starts with $2b$ or $2a$)
        if (
          user.password.startsWith("$2b$") ||
          user.password.startsWith("$2a$")
        ) {
          // Bcrypt comparison for hashed passwords
          passwordValid = await bcrypt.compare(password, user.password);
        } else {
          // Plain text comparison for init.sql data
          passwordValid = password === user.password;

          // ✅ Auto-upgrade plain text to hashed password
          if (passwordValid) {
            console.log(
              `🔄 Upgrading plain text password to hash for user: ${user.email}`
            );
            const hashedPassword = await bcrypt.hash(password, 10);
            await User.update(
              { password: hashedPassword },
              { where: { id: user.id } }
            );
          }
        }

        if (!passwordValid) {
          throw new Error("Email atau password salah");
        }

        // ✅ LOG SUCCESSFUL LOGIN (for security monitoring)
        console.log(`✅ User login successful: ${user.email} (${user.role})`);

        const token = generateToken(user);

        // ✅ Don't return password in response
        const { password: _, ...userWithoutPassword } = user.toJSON();

        return { token, user: userWithoutPassword };
      } catch (error) {
        console.error("Authentication error:", error);
        throw error;
      }
    },

    changePassword: async (_, { currentPassword, newPassword }, context) => {
      try {
        if (!context.user) {
          throw new Error("Authentication required");
        }

        const user = await User.findByPk(context.user.id);
        if (!user) {
          throw new Error("User tidak ditemukan");
        }

        // ✅ Verify current password (handle both hashed and plain text)
        let currentPasswordValid = false;

        if (
          user.password.startsWith("$2b$") ||
          user.password.startsWith("$2a$")
        ) {
          currentPasswordValid = await bcrypt.compare(
            currentPassword,
            user.password
          );
        } else {
          currentPasswordValid = currentPassword === user.password;
        }

        if (!currentPasswordValid) {
          throw new Error("Password saat ini salah");
        }

        // Validate new password
        if (newPassword.length < 6) {
          throw new Error("Password baru minimal 6 karakter");
        }

        // ✅ Check if new password is different from current
        if (currentPassword === newPassword) {
          throw new Error("Password baru harus berbeda dari password saat ini");
        }

        // Hash and update new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await User.update(
          { password: hashedNewPassword },
          { where: { id: user.id } }
        );

        console.log(`🔄 Password changed for user: ${user.email}`);

        return {
          success: true,
          message: "Password berhasil diubah",
        };
      } catch (error) {
        console.error("Error changing password:", error);
        throw error;
      }
    },

    // ✅ NEW: Delete user (admin only)
    deleteUser: async (_, { id }, context) => {
      try {
        if (!context.user || context.user.role !== "admin") {
          throw new Error("Admin access required");
        }

        const targetUser = await User.findByPk(id);
        if (!targetUser) {
          throw new Error("User tidak ditemukan");
        }

        // Prevent deleting the last admin
        if (targetUser.role === "admin") {
          const adminCount = await User.count({ where: { role: "admin" } });
          if (adminCount <= 1) {
            throw new Error("Tidak dapat menghapus admin terakhir");
          }
        }

        // Prevent self-deletion
        if (context.user.id === parseInt(id)) {
          throw new Error("Tidak dapat menghapus akun sendiri");
        }

        const userName = targetUser.name;
        const userEmail = targetUser.email;

        await User.destroy({ where: { id } });

        console.log(
          `🗑️ User deleted: ${userEmail} by admin: ${context.user.email}`
        );

        return {
          success: true,
          message: `User ${userName} berhasil dihapus`,
        };
      } catch (error) {
        console.error("Error deleting user:", error);
        throw error;
      }
    },

    // ✅ NEW: Reset user password (admin only)
    resetUserPassword: async (_, { id, newPassword }, context) => {
      try {
        if (!context.user || context.user.role !== "admin") {
          throw new Error("Admin access required");
        }

        const targetUser = await User.findByPk(id);
        if (!targetUser) {
          throw new Error("User tidak ditemukan");
        }

        if (newPassword.length < 6) {
          throw new Error("Password minimal 6 karakter");
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.update({ password: hashedPassword }, { where: { id } });

        console.log(
          `🔄 Admin reset password for user: ${targetUser.email} by: ${context.user.email}`
        );

        return {
          success: true,
          message: `Password user ${targetUser.name} berhasil direset`,
        };
      } catch (error) {
        console.error("Error resetting password:", error);
        throw error;
      }
    },

    // ✅ NEW: Toggle user status (placeholder for future implementation)
    toggleUserStatus: async (_, { id }, context) => {
      try {
        if (!context.user || context.user.role !== "admin") {
          throw new Error("Admin access required");
        }

        const targetUser = await User.findByPk(id);
        if (!targetUser) {
          throw new Error("User tidak ditemukan");
        }

        // For now, just return the user (placeholder for future status field)
        // In future, you can add an 'active' field to User model
        console.log(
          `🔄 Toggle status for user: ${targetUser.email} by admin: ${context.user.email}`
        );

        return targetUser;
      } catch (error) {
        console.error("Error toggling user status:", error);
        throw error;
      }
    },
  },
};
