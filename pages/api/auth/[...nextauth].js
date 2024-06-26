import NextAuth from 'next-auth/next';
import CredentialsProvider from 'next-auth/providers/credentials';
import db from '../../../utils/db';
import User from '../../../models/user';
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

      return session;
    },
  },

  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        await db.connect();
        const user = await User.findOne({ email: credentials.email });
        await db.disconnect();
        if (user && bcryptjs.compareSync(credentials.password, user.password)) {
          return {
            _id: user._id,
            name: user.name,
            email: user.email,
            companyName: user.companyName,
            companyEinCode: user.companyEinCode,
            image: 'f',
            isAdmin: user.isAdmin,
          };
        }
        throw new Error('Invalid email or password');
      },
    }),
  ],
});
