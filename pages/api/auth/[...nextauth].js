import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcryptjs from "bcryptjs";
import db from "../../../utils/db";
import WpUser from "../../../models/WpUser";

/**
 * Maps the response from Google People API to a compact profile.
 * Fields covered with basic scopes (openid, email, profile):
 * - names, photos, emailAddresses, locales
 */
function mapPeopleProfile(p) {
  const name = p?.names?.[0];
  const photo = (p?.photos || []).find((ph) => ph?.default) || p?.photos?.[0];
  const email = p?.emailAddresses?.[0];
  const locale = p?.locales?.[0]; // { value: "is", ... }

  return {
    fullName: name?.displayName || "",
    givenName: name?.givenName || "",
    familyName: name?.familyName || "",
    picture: photo?.url || "",
    email: email?.value || "",
    locale: locale?.value || "",
  };
}

export const authOptions = {
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: "/Login", // your login page
    error: "/Login", // optional: errors redirect to /Login
  },

  providers: [
    // === LOGIN WITH EMAIL/PASSWORD (your current flow) ===
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

        // What you return here becomes the 'user' in the jwt callback on first login
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

    // === LOGIN WITH GOOGLE ===
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // If you want to enforce/suggest a corporate domain later:
    }),
  ],

  /**
   * signIn:
   * - If the provider is Google and NOT exist in DB → REDIRECT to /Register with prefill info
   * - If exist but inactive → redirect to /Login with error
   * - If everything is ok → return true
   */
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        const email =
          profile?.email ||
          user?.email ||
          (typeof user === "object" && user?.email) ||
          "";

        // If Google doesn't provide an email, we don't proceed (edge-case)
        if (!email) {
          return "/Login?error=GoogleNoEmail";
        }

        await db.connect(true);
        const dbUser = await WpUser.findOne({ email }).select(
          "_id firstName lastName email active approved restricted companyName companyEinCode isAdmin",
        );

        // 1) NOT EXIST → redirect to Register with prefill info
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

        // 2) EXIST BUT INACTIVE → block
        if (!dbUser.active) {
          return "/Login?error=Inactive";
        }

        // 3) EXIST AND ACTIVE → ok
        return true;
      }

      // For credentials or other providers
      return true;
    },

    /**
     * jwt:
     * - On first login, copy data to token.
     * - If the login was with Google and there is an access_token, call the People API,
     *   enrich the token (picture, locale, names) and optionally update WpUser.
     * - On subsequent sessions, refresh from DB to maintain flags.
     */
    async jwt({ token, user, account }) {
      // First login (credentials or google)
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

        // If it was Google, try to enrich with People API
        if (account?.provider === "google" && account?.access_token) {
          try {
            const res = await fetch(
              "https://people.googleapis.com/v1/people/me?personFields=names,photos,emailAddresses,locales",
              { headers: { Authorization: `Bearer ${account.access_token}` } },
            );
            if (res.ok) {
              const people = await res.json();
              const prof = mapPeopleProfile(people);

              // Complete/adjust token with People API data
              token.picture = prof.picture || token.picture || user.image || "";
              token.locale = prof.locale || token.locale || user.locale || "";
              token.firstName = token.firstName || prof.givenName || "";
              token.lastName = token.lastName || prof.familyName || "";
              token.email = token.email || prof.email || "";

              // If already exists in DB, update suggested cosmetic data:
              // (Make sure to have these fields in your schema if you want to persist them)
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
                        avatarUrl: token.picture || null, // <-- add to schema if you use it
                        preferredLocale: token.locale || null, // <-- add to schema if you use it
                      },
                    },
                  );
                }
              }
            }
          } catch {
            // do not break login if People API fails
          }
        }

        // Reinforce from DB if it was Google (already existed) — your original logic
        if (account?.provider === "google") {
          await db.connect(true);
          const dbUser = await WpUser.findOne({ email: token.email }).select(
            "_id firstName lastName email active approved restricted companyName companyEinCode isAdmin",
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
      // Subsequent sessions → refresh from DB
      else if (token._id) {
        await db.connect(true);
        const dbUser = await WpUser.findById(token._id).select(
          "firstName lastName email active approved restricted",
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

        // Expose enriched data from People API / OIDC
        picture: token.picture || null,
        locale: token.locale || null,
      };
      return session;
    },
  },
};

export default NextAuth(authOptions);
