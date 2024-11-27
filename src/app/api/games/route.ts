import { prisma } from '@/utils/prisma';

import { NextRequest, NextResponse } from 'next/server';

export const POST = async (req: NextRequest) => {
  try {
    // console.log('Available Prisma models:', Object.keys(prisma));
    // const { date } = await req.json();
    const { data } = await req.json();
    // console.log(1111, data);

    // console.log('Received game date:', date, typeof date);

    // if (!date)
    //   return NextResponse.json({ error: 'Date is required' }, { status: 400 });

    const existingGame = await prisma.game.findFirst({
      where: {
        gameDate: data,
      },
    });

    // console.log(2222, existingGame);

    if (!existingGame) {
      const newGame = await prisma.game.create({
        data: {
          gameDate: data,
        },
      });
      console.log('Created game:', newGame);
      return NextResponse.json({ newGame: newGame });
    } else {
      return NextResponse.json(
        { message: 'Game already exists' },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Could not post game' },
      { status: 500 }
    );
  }
};

export const GET = async () => {
  try {
    const games = await prisma.game.findFirst({
      orderBy: {
        gameDate: 'desc',
      },
      take: 1,
    });
    return NextResponse.json(games);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Could not post game' },
      { status: 500 }
    );
  }
};
