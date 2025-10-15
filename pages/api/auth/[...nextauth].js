import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import db from "../../../utils/db";
import WpUser from "../../../models/WpUser";
import bcryptjs from "bcryptjs";

export default NextAuth({
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    // 🔹 LOGIN TRADICIONAL CON EMAIL/PASSWORD
    CredentialsProvider({
      async authorize(credentials) {
        await db.connect(true);
        const user = await WpUser.findOne({ email: credentials.email });

        if (!user) throw new Error("Invalid email or password");
        if (!user.active)
          throw new Error("Your account is inactive. Please contact support.");
        if (!bcryptjs.compareSync(credentials.password, user.password))
          throw new Error("Invalid email or password");

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

    // 🔹 LOGIN CON GOOGLE
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  // 🔹 CALLBACKS
  callbacks: {
    async jwt({ token, user, account }) {
      // Caso 1: primer login (sea con credenciales o Google)
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

        // Si el login fue con Google, sincronizamos con tu base de datos
        if (account?.provider === "google") {
          await db.connect(true);
          let dbUser = await WpUser.findOne({ email: user.email });

          // Si no existe, lo creamos (puedes cambiar esta lógica si quieres aprobarlos manualmente)
          if (!dbUser) {
            dbUser = await WpUser.create({
              firstName: token.firstName,
              lastName: token.lastName,
              email: token.email,
              companyName: "",
              companyEinCode: "",
              password: "", // no se usa para Google
              active: true,
              approved: false, // puedes marcarlo en false para requerir aprobación
              restricted: false,
              isAdmin: false,
            });
          }

          token._id = dbUser._id;
          token.active = dbUser.active;
          token.approved = dbUser.approved;
          token.restricted = dbUser.restricted;
        }
      }

      // Caso 2: sesión existente → refrescar datos
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
