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
    signIn: "/Login", // tu página de login
    error: "/Login", // errores vuelven a /Login (opcional)
  },

  providers: [
    // === LOGIN CON EMAIL/PASSWORD (tu flujo actual) ===
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

        // Lo que queda en "user" viaja a callbacks.jwt como 'user'
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
      // authorization: { params: { hd: "tuempresa.com" } }, // si luego quieres sugerir dominio
    }),
  ],

  /**
   * signIn:
   * - Si el proveedor es Google y NO existe el usuario en DB → REDIRIGE a /Register con datos prellenables
   * - Si existe pero está inactivo → redirige a /Login con error
   * - Si todo ok → continúa (return true)
   */
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        const email =
          profile?.email ||
          user?.email ||
          (typeof user === "object" && user?.email) ||
          "";

        // Seguridad mínima: si Google no nos da email, no continuamos
        if (!email) {
          return "/Login?error=GoogleNoEmail";
        }

        await db.connect(true);
        const dbUser = await WpUser.findOne({ email }).select(
          "_id firstName lastName email active approved restricted companyName companyEinCode isAdmin"
        );

        // 1) NO EXISTE → redirigir a Register con info para prellenar
        if (!dbUser) {
          // Puedes enviar nombre y foto para prellenar tu formulario
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

          // Puedes devolver ruta relativa
          return `/Register?${qs.toString()}`;
        }

        // 2) EXISTE PERO INACTIVO → redirigir a login con error
        if (!dbUser.active) {
          return "/Login?error=Inactive";
        }

        // 3) EXISTE Y ACTIVO → permitir continuar
        return true;
      }

      // Para credentials u otros providers
      return true;
    },

    /**
     * jwt:
     * - En primer login, copia datos a token.
     * - En sesiones siguientes, refresca desde DB para mantener flags.
     */
    async jwt({ token, user, account }) {
      // Primer login (credenciales o google)
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

        // Si fue Google y existe en DB, reforzamos con DB (signIn ya filtró no-existentes)
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
      // Sesiones posteriores → refresco
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
