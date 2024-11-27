import {  NextResponse } from 'next/server';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';


export async function GET() {
  try {
    const { isAuthenticated } = getKindeServerSession();
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
