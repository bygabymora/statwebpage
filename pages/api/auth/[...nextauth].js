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
      if (user?._id) {
        token._id = user._id;
      }
      if (user?.isAdmin) {
        token.isAdmin = user.isAdmin;
      }
      if (user?.companyName) {
        token.companyName = user.companyName;
      }
      if (user?.companyEinCode) {
        token.companyEinCode = user.companyEinCode;
      }
      if (user?.active !== undefined) {
        token.active = user.active;
      }
      if (user?.approved !== undefined) {
        token.approved = user.approved;
      }
      return token;
    },
  
    async session({ session, token }) {
      if (token?._id) {
        session.user._id = token._id;
      }
      if (token?.isAdmin) {
        session.user.isAdmin = token.isAdmin;
      }
      if (token?.companyName) {
        session.user.companyName = token.companyName;
      }
      if (token?.companyEinCode) {
        session.user.companyEinCode = token.companyEinCode;
      }
      if (token?.active !== undefined) {
        session.user.active = token.active;
      }
      if (token?.approved !== undefined) {
        session.user.approved = token.approved;
      }
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
      
        // Validate if the user is approved and active
        if (!user.active || !user.approved) {
          throw new Error('Your account is not approved yet.');
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
