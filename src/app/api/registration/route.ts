import { getLatestGame } from '@/actions/actions';
import changeKindeUser from '@/utils/changeKindeUser';
import { prisma } from '@/utils/prisma';
import { revalidatePath } from 'next/cache';
import { NextResponse, NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const latestGame = await getLatestGame();
    console.log('LATEST GAME', latestGame);

    if (!body.user || !latestGame)
      return NextResponse.json(
        { error: 'Missing user or game data' },
        { status: 400 }
      );

    console.log('BODYY', body);

    const goodUser = changeKindeUser(body.user);

    const result = await prisma.$transaction(async (tx) => {
      // Upsert the user first
      const user = await tx.user.upsert({
        where: { id: goodUser.id },
        update: {
          email: goodUser.email || '',
          familyName: goodUser.familyName,
          givenName: goodUser.givenName,
          picture: goodUser.picture,
          username: goodUser.username || null,
          phoneNumber: goodUser.phoneNumber || null,
        },
        create: {
          id: goodUser.id,
          email: goodUser.email || '',
          familyName: goodUser.familyName,
          givenName: goodUser.givenName,
          picture: goodUser.picture,
          username: goodUser.username || null,
          phoneNumber: goodUser.phoneNumber || null,
        },
      });

      // Then create the game registration
      const existingRegistration = await tx.gameRegistration.findUnique({
        where: {
          userId_gameId: {
            userId: user.id,
            gameId: latestGame.id,
          },
        },
      });

      console.log('existing registration', existingRegistration);

      if (!existingRegistration) {
        const newRegistration = await tx.gameRegistration.create({
          data: {
            userId: user.id,
            givenName: user.givenName,
            familyName: user.familyName,
            email: user.email,
            gameId: latestGame.id, // Changed from body.game.id to latestGame.id
          },
        });
        console.log('new registration', newRegistration);
        return {
          newRegistration,
          isRegistered: true,
        };
      }

      revalidatePath('/status');
      console.log('DONE REVALIATE');

      return {
        existingRegistration,
        isRegistered: true,
      };
    });

    // Return a NextResponse based on the transaction result
    return NextResponse.json(result, { status: 201 });
  } catch (error: unknown) {
    console.error(error);

    if (error instanceof Error) {
      if (error.message.includes('Unique constraint failed')) {
        return NextResponse.json(
          {
            message: 'User already registered for this game',
            isRegistered: true,
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { message: `Error: ${error.message}` },
        { status: 500 }
      );
    }

    // Handle unknown error types
    return NextResponse.json(
      { message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
