import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import db from "../../../utils/db";
import WpUser from "../../../models/WpUser";
import bcryptjs from "bcryptjs";

export default NextAuth({
  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Newly authenticated user
        token._id = user._id;
        token.lastName = user.lastName;
        token.firstName = user.firstName;
        token.email = user.email;
        token.isAdmin = user.isAdmin;
        token.companyName = user.companyName;
        token.companyEinCode = user.companyEinCode;
        token.active = user.active;
        token.approved = user.approved;
        token.restricted = user.restricted;
      } else if (token._id) {
        // Check the database if the user is still active
        await db.connect(true);
        const dbUser = await WpUser.findById(token._id).select(
          "firstName lastName email active approved restricted"
        );

        if (dbUser) {
          token.lastName = dbUser.lastName;
          token.firstName = dbUser.firstName;
          token.email = dbUser.email;
          token.active = dbUser.active;
          token.approved = dbUser.approved;
          token.restricted = dbUser.restricted;
        } else {
          token.active = false;
        }
      }

      return token;
    },

    async session({ session, token }) {
      session.user = {
        _id: token._id,
        lastName: token.lastName,
        firstName: token.firstName,
        email: token.email,
        isAdmin: token.isAdmin,
        companyName: token.companyName,
        companyEinCode: token.companyEinCode,
        active: token.active,
        approved: token.approved,
        restricted: token.restricted,
      };
      return session;
    },
  },

  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        await db.connect(true);
        const user = await WpUser.findOne({ email: credentials.email });

        if (!user) {
          throw new Error("Invalid email or password");
        }

        if (!user.active) {
          throw new Error("Your account is inactive. Please contact support.");
        }

        if (!bcryptjs.compareSync(credentials.password, user.password)) {
          throw new Error("Invalid email or password");
        }

        return {
          _id: user._id,
          lastName: user.lastName,
          firstName: user.firstName,
          email: user.email,
          companyName: user.companyName,
          companyEinCode: user.companyEinCode,
          image: "f",
          isAdmin: user.isAdmin,
          active: user.active,
          approved: user.approved,
          restricted: user.restricted,
        };
      },
    }),
  ],
});
