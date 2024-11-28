import { prisma } from '@/utils/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const POST = async (req: NextRequest) => {
  try {
    const { data } = await req.json();
    console.log(1111, data);

    const existingGame = await prisma.game.findFirst({
      where: {
        gameDate: data,
      },
    });

    if (!existingGame) {
      const newGame = await prisma.game.create({
        data: {
          gameDate: data,
        },
      });
      console.log('Created game:', newGame);
      return NextResponse.json({ newGame }, { status: 201 });
    } else {
      return NextResponse.json(
        { message: 'Game already exists' },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Could not create game' },
      { status: 500 }
    );
  }
};

export const GET = async () => {
  try {
    const latestGame = await prisma.game.findFirst({
      orderBy: {
        gameDate: 'desc',
      },
      take: 1,
    });

    if (!latestGame) {
      return NextResponse.json(
        { message: 'No games found' },
        { status: 404 }
      );
    }

    return NextResponse.json(latestGame, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Could not retrieve game' },
      { status: 500 }
    );
  }
};