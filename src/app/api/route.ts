import { NextRequest, NextResponse } from 'next/server';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { NextApiRequest } from 'next';

export async function GET() {
  try {
    // res.status(200).json(1);
    const { getUser, isAuthenticated } = getKindeServerSession();
    // const user = await getUser();

    const isAuth = await isAuthenticated();
    return NextResponse.json(isAuth);
  } catch (error) {
    console.error('Error occurred:', error);

    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
