import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';

import { NextRequest, NextResponse } from 'next/server';

const labas = async  (req: NextRequest) => {
  console.log('labas middleware');
  const timestamp = new Date().toISOString();
  const response = NextResponse.next();

  if (req.nextUrl.pathname === '/profile' || req) {
    // More aggressive caching for profile
    console.log(`[1111 Middleware Executed] 
      Path: ${req.nextUrl.pathname}
      Timestamp: ${timestamp}
      URL: ${req.url}
      `);
    response.headers.set(
      'Cache-Control',
      'public, max-age=300, stale-while-revalidate=30'
    );

    const { getUser } = getKindeServerSession();
    const user = await getUser();
    console.log('MIDDLEWARE KINDE USER',user);
    


    // verifyAndSaveUser();
    const apiCall = async () => {
      await fetch(
        `${
          process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
        }/api/user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user }),
        }
      );
    };
    apiCall();
    console.log('done');
  } else {
    // Less caching for dynamic routes
    response.headers.set(
      'Cache-Control',
      'no-cache, no-store, must-revalidate'
    );
  }

  return response;
};

export default labas;

export const config = {
  matcher: ['/', '/profile'],
};

export const verifyAndSaveUser = async () => {
  const { getUser } = getKindeServerSession();
  const kindeUser = await getUser();

  if (!kindeUser) {
    return null;
  } else {
    console.log('KINDE USER MIDDLEWARE');
  }
  //   Check or create user with memoization
  const user = await prisma.user.upsert({
    where: {
      id: kindeUser.id,
    },
    update: {
      email: kindeUser.email || '',
      familyName: kindeUser.family_name || '',
      givenName: kindeUser.given_name || '',
      picture: kindeUser.picture,
      username: kindeUser.username,
      phoneNumber: kindeUser.phone_number,
    },
    create: {
      id: kindeUser.id,
      email: kindeUser.email || '',
      familyName: kindeUser.family_name || '',
      givenName: kindeUser.given_name || '',
      picture: kindeUser.picture,
      username: kindeUser.username,
      phoneNumber: kindeUser.phone_number,
    },
  });
  console.log('from middleware', user);

  return user;
};
