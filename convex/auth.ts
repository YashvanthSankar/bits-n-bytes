import Google from '@auth/core/providers/google';
import { convexAuth } from '@convex-dev/auth/server';
import { allowedAuthRedirect } from '../src/domain/authRedirect';

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Google({ authorization: { params: { scope: 'openid email profile' } }, profile: profile => ({
    id: profile.sub, name: profile.name, image: profile.picture, email: profile.email, emailVerified: profile.email_verified === true,
  }) })],
  callbacks: {
    redirect: async ({ redirectTo }) => allowedAuthRedirect(redirectTo, process.env.AUTH_EXPO_GO_REDIRECTS),
  },
});
