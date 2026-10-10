import Google from '@auth/core/providers/google';
import { convexAuth } from '@convex-dev/auth/server';
import { allowedAuthRedirect } from '../src/domain/authRedirect';

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Google({ authorization: { params: { scope: 'openid email profile' } } })],
  callbacks: {
    redirect: async ({ redirectTo }) => allowedAuthRedirect(redirectTo),
  },
});
