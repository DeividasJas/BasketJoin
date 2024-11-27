import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { user } = await req.json();
    console.log('Request body:', user);

    // The incoming data doesn't have username and phone_number,
    // so let's adjust the creation object to match the actual data
    const newUser = await prisma.user.create({
      data: {
        id: user.id,
        email: user.email,
        familyName: user.familyName,
        givenName: user.givenName,
        picture: user.picture,
        username: null,
        phoneNumber: null,
      },
    });

    console.log('new user created', newUser);
    return NextResponse.json(newUser);
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { message: 'Could not post user' },
      { status: 500 }
    );
  }
}
