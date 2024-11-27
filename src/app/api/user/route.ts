import changeKindeUser from '@/utils/changeKindeUser';
import { NextResponse } from 'next/server';
import { prisma } from '@/utils/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Request body:', body.user);

    const { user } = body;
    if (!user.email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    console.log('existing user', existingUser);

    if (!existingUser) {
      const goodUser = changeKindeUser(user);
      console.log('goodUser ---->', goodUser);

      // Add null check before creating user
      if (!goodUser) {
        return NextResponse.json(
          { error: 'Unable to process user' },
          { status: 400 }
        );
      }

      const newUser = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email,
          familyName: user.family_name,
          givenName: user.given_name,
          picture: user.picture ?? null,
          username: user.username ?? null,
          phoneNumber: user.phone_number ?? null,
        },
      });

      return NextResponse.json({ newUser }, { status: 201 });
    }

    return NextResponse.json(
      { existingUser, isRegistered: true },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
