import { NextResponse } from 'next/server';
import { auth } from '@/auth';


export async function GET() {
  try {
    const session = await auth();
    const isAuth = !!session;
    return NextResponse.json(isAuth);
  } catch (error) {
    console.error('Error occurred:', error);

    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
