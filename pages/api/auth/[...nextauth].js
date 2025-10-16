import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcryptjs from "bcryptjs";
import db from "../../../utils/db";
import WpUser from "../../../models/WpUser";

/**
 * Mapea la respuesta de Google People API a un perfil compacto.
 * Campos cubiertos con los scopes básicos (openid, email, profile):
 * - names, photos, emailAddresses, locales
 */
function mapPeopleProfile(p) {
  const name = p?.names?.[0];
  const photo = (p?.photos || []).find((ph) => ph?.default) || p?.photos?.[0];
  const email = p?.emailAddresses?.[0];
  const locale = p?.locales?.[0]; // { value: "es", ... }

  return {
    fullName: name?.displayName || "",
    givenName: name?.givenName || "",
    familyName: name?.familyName || "",
    picture: photo?.url || "",
    email: email?.value || "",
    locale: locale?.value || "",
  };
}

export default NextAuth({
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: "/Login", // tu página de login
    error: "/Login", // opcional: errores vuelven a /Login
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

        // Lo que retornes aquí llega como 'user' al callback jwt en el primer login
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
      // Si luego quieres forzar/insinuar dominio corporativo:
      // authorization: { params: { hd: "tuempresa.com" } },
    }),
  ],

  /**
   * signIn:
   * - Si el proveedor es Google y NO existe en DB → REDIRIGE a /Register con datos para prellenar
   * - Si existe pero está inactivo → redirige a /Login con error
   * - Si todo ok → return true
   */
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        const email =
          profile?.email ||
          user?.email ||
          (typeof user === "object" && user?.email) ||
          "";

        // Si Google no nos da email, no seguimos (edge-case)
        if (!email) {
          return "/Login?error=GoogleNoEmail";
        }

        await db.connect(true);
        const dbUser = await WpUser.findOne({ email }).select(
          "_id firstName lastName email active approved restricted companyName companyEinCode isAdmin"
        );

        // 1) NO EXISTE → redirige a Register con info para prellenar
        if (!dbUser) {
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

          return `/Register?${qs.toString()}`;
        }

        // 2) EXISTE PERO INACTIVO → bloquea
        if (!dbUser.active) {
          return "/Login?error=Inactive";
        }

        // 3) EXISTE Y ACTIVO → ok
        return true;
      }

      // Para credentials u otros providers
      return true;
    },

    /**
     * jwt:
     * - En primer login copia datos a token.
     * - Si el login fue con Google y hay access_token, llama a People API,
     *   enriquece token (picture, locale, nombres) y opcionalmente actualiza WpUser.
     * - En sesiones siguientes, refresca desde DB para mantener flags.
     */
    async jwt({ token, user, account }) {
      // Primer login (credentials o google)
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

        // Si fue Google, intenta enriquecer con People API
        if (account?.provider === "google" && account?.access_token) {
          try {
            const res = await fetch(
              "https://people.googleapis.com/v1/people/me?personFields=names,photos,emailAddresses,locales",
              { headers: { Authorization: `Bearer ${account.access_token}` } }
            );
            if (res.ok) {
              const people = await res.json();
              const prof = mapPeopleProfile(people);

              // Completar/ajustar token con datos de People
              token.picture = prof.picture || token.picture || user.image || "";
              token.locale = prof.locale || token.locale || user.locale || "";
              token.firstName = token.firstName || prof.givenName || "";
              token.lastName = token.lastName || prof.familyName || "";
              token.email = token.email || prof.email || "";

              // Si ya existe en DB, actualiza datos cosméticos sugeridos:
              // (Asegúrate de tener estos campos en tu schema si deseas persistirlos)
              if (token.email) {
                await db.connect(true);
                const existing = await WpUser.findOne({
                  email: token.email,
                }).select("_id");
                if (existing?._id) {
                  await WpUser.updateOne(
                    { _id: existing._id },
                    {
                      $set: {
                        firstName: token.firstName,
                        lastName: token.lastName,
                        avatarUrl: token.picture || null, // <-- agrega al schema si lo usas
                        preferredLocale: token.locale || null, // <-- agrega al schema si lo usas
                      },
                    }
                  );
                }
              }
            }
          } catch {
            // no rompas el login si falla People API
          }
        }

        // Reforzar desde DB si fue Google (ya existía) — tu lógica original
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
      // Sesiones siguientes → refresca desde DB
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

        // Exponer datos enriquecidos por People API / OIDC
        picture: token.picture || null,
        locale: token.locale || null,
      };
      return session;
    },
  },
});
