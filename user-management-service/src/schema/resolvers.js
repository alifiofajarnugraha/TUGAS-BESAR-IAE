const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { generateToken, verifyToken } = require("../auth");

module.exports = {
  Query: {
    getUser: async (_, { id }) => await User.findByPk(id),
    users: async () => await User.findAll(),
    getCurrentUser: async (_, __, { token }) => {
      if (!token) {
        throw new Error("Authentication required");
      }

      try {
        const decoded = verifyToken(token.replace("Bearer ", ""));
        const user = await User.findByPk(decoded.id);

        if (!user) {
          throw new Error("User not found");
        }

        return user;
      } catch (error) {
        throw new Error("Invalid token");
      }
    },
  },

  Mutation: {
    createUser: async (_, { input }) => {
      const allowedRoles = ["customer", "agent", "admin"];

      // Pakai role dari input kalau valid, kalau tidak default ke customer
      const role =
        input.role && allowedRoles.includes(input.role)
          ? input.role
          : "customer";

      if (input.role && !allowedRoles.includes(input.role)) {
        throw new Error("Role tidak valid. Pilih: customer, agent, admin");
      }

      const hashed = await bcrypt.hash(input.password, 10);
      const user = await User.create({
        ...input,
        password: hashed,
        role, // pakai role yang sudah divalidasi
      });

      return user;
    },

    updateUserProfile: async (_, { id, input }, context) => {
      const currentUser = context.user;

      if (input.role && (!currentUser || currentUser.role !== "admin")) {
        throw new Error("Hanya admin yang boleh mengubah role");
      }

      await User.update(input, { where: { id } });
      return await User.findByPk(id);
    },

    authenticateUser: async (_, { email, password }) => {
      const user = await User.findOne({ where: { email } });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new Error("Invalid credentials");
      }
      const token = generateToken(user);
      return { token, user };
    },
  },
};
