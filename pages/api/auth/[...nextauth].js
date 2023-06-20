import NextAuth from 'next-auth/next';

export default NextAuth({
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt(token, user, account, profile, isNewUser) {
      if (user?._id) token.id = user.id;
      if (user?.isAdmin) token.isAdmin = user.isAdmin;
      return token;
    },
  },
});
