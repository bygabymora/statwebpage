import NextAuth from 'next-auth/next';
import CredentialsProvider from 'next-auth/providers/credentials';
import db from '../../../utils/db';
import WpUser from '../../../models/WpUser';
import bcryptjs from 'bcryptjs';

export default NextAuth({
  session: {
    strategy: 'jwt',
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        console.log('Usuario autenticado, almacenando en token:', user);
        // Newly authenticated user
        token._id = user._id;
        token.name = user.name;
        token.email = user.email;
        token.isAdmin = user.isAdmin;
        token.companyName = user.companyName;
        token.companyEinCode = user.companyEinCode;
        token.active = user.active;
        token.approved = user.approved;
      } else if (token._id) {
        // Check the database if the user is still active
        await db.connect();
        const dbUser = await WpUser.findById(token._id).select('name email active approved');
        await db.disconnect();

        if (dbUser) {
          token.name = dbUser.name;
          token.email = dbUser.email;
          token.active = dbUser.active;
          token.approved = dbUser.approved;
        } else {
          token.active = false;
        }
      }

      return token;
    },

    async session({ session, token }) {
      session.user = {
        _id: token._id,
        name: token.name, 
        email: token.email, 
        isAdmin: token.isAdmin,
        companyName: token.companyName,
        companyEinCode: token.companyEinCode,
        active: token.active,
        approved: token.approved,
      };
      console.log('Session final:', session);
      return session;
    }
  },

  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        await db.connect();
        const user = await WpUser.findOne({ email: credentials.email });
        await db.disconnect();
      
        if (!user) {
          throw new Error('Invalid email or password');
        }
      
        if (!bcryptjs.compareSync(credentials.password, user.password)) {
          throw new Error('Invalid email or password');
        }

        if (!user.active) {
          throw new Error('Your account is inactive. Contact us for more information.');
        }

        return {
          _id: user._id,
          name: user.name,
          email: user.email,
          companyName: user.companyName,
          companyEinCode: user.companyEinCode,
          image: 'f',
          isAdmin: user.isAdmin,
          active: user.active,
          approved: user.approved,
        };
      }
    }),
  ],
});
