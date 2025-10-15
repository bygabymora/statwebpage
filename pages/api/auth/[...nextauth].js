import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcryptjs from "bcryptjs";
import db from "../../../utils/db";
import WpUser from "../../../models/WpUser";

export default NextAuth({
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: "/Login", // your login page
    error: "/Login", // errors return to /Login (optional)
  },

  providers: [
    // === LOGIN CON EMAIL/PASSWORD (your current flow) ===
    CredentialsProvider({
      async authorize(credentials) {
        await db.connect(true);

        const user = await WpUser.findOne({ email: credentials.email });
        if (!user) throw new Error("Invalid email or password");
        if (!user.active) {
          throw new Error("Your account is inactive. Please contact support.");
        }
        const ok = bcryptjs.compareSync(credentials.password, user.password);
        if (!ok) throw new Error("Invalid email or password");

        // What remains in "user" travels to callbacks.jwt as 'user'
        return {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          companyName: user.companyName,
          companyEinCode: user.companyEinCode,
          isAdmin: user.isAdmin,
          active: user.active,
          approved: user.approved,
          restricted: user.restricted,
        };
      },
    }),

    // === LOGIN CON GOOGLE ===
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // authorization: { params: { hd: "company.com" } }, // If you then want to suggest domain
    }),
  ],

  /**
   * signIn:
   * - If the provider is Google and the user does NOT exist in DB → REDIRECT to /Register with prefillable data
   * - If it exists but is inactive → redirects to /Login with error
   * - If everything ok → continue (return true)
   */
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        const email =
          profile?.email ||
          user?.email ||
          (typeof user === "object" && user?.email) ||
          "";

        // Minimum security: if Google does not give us email, we do not continue
        if (!email) {
          return "/Login?error=GoogleNoEmail";
        }

        await db.connect(true);
        const dbUser = await WpUser.findOne({ email }).select(
          "_id firstName lastName email active approved restricted companyName companyEinCode isAdmin"
        );

        // 1) DOES NOT EXIST → redirect to Register with info to prefill
        if (!dbUser) {
          // You can send name and picture to prefill your form
          const prefillName =
            profile?.name ||
            [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
            "";
          const picture = profile?.picture || "";

          const qs = new URLSearchParams({
            from: "google",
            prefillEmail: email,
            prefillName,
            picture,
          });

          // You can return a relative path
          return `/Register?${qs.toString()}`;
        }

        // 2) EXISTS BUT INACTIVE → redirect to login with error
        if (!dbUser.active) {
          return "/Login?error=Inactive";
        }

        // 3) EXISTS AND ACTIVE → allow to continue
        return true;
      }

      // For credentials or other providers
      return true;
    },

    /**
     * jwt:
     * - At first login, copy data to token
     * - In subsequent sessions, refresh from DB to maintain flags.
     */
    async jwt({ token, user, account }) {
      // At first login (credentials or google)
      if (user) {
        token._id = user._id || null;
        token.firstName = user.firstName || user.name?.split(" ")[0] || "";
        token.lastName =
          user.lastName || user.name?.split(" ").slice(1).join(" ") || "";
        token.email = user.email;
        token.isAdmin = user.isAdmin || false;
        token.companyName = user.companyName || null;
        token.companyEinCode = user.companyEinCode || null;
        token.active = user.active ?? true;
        token.approved = user.approved ?? false;
        token.restricted = user.restricted ?? false;

        // If it was Google and exists in DB, we reinforce with DB (signIn already filtered non-existent)
        if (account?.provider === "google") {
          await db.connect(true);
          const dbUser = await WpUser.findOne({ email: token.email }).select(
            "_id firstName lastName email active approved restricted companyName companyEinCode isAdmin"
          );
          if (dbUser) {
            token._id = dbUser._id;
            token.firstName = dbUser.firstName || token.firstName;
            token.lastName = dbUser.lastName || token.lastName;
            token.companyName = dbUser.companyName ?? token.companyName;
            token.companyEinCode =
              dbUser.companyEinCode ?? token.companyEinCode;
            token.isAdmin = !!dbUser.isAdmin;
            token.active = dbUser.active;
            token.approved = dbUser.approved;
            token.restricted = dbUser.restricted;
          }
        }
      }
      // Subsequent sessions → refresh from DBv
      else if (token._id) {
        await db.connect(true);
        const dbUser = await WpUser.findById(token._id).select(
          "firstName lastName email active approved restricted"
        );
        if (dbUser) {
          token.firstName = dbUser.firstName;
          token.lastName = dbUser.lastName;
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
        firstName: token.firstName,
        lastName: token.lastName,
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
});
