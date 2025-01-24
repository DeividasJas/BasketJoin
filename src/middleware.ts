import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse, NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const user_id = request.cookies.get("user_id");
  if (!user_id) {
    const { getUser } = getKindeServerSession();
    const kindeUser = await getUser();
    response.cookies.set("user_id", kindeUser?.id);
  }
  return response;
}

export const config = {
  matcher: [
    "/game-status/:path*",
    "/admin/:path*",
    "/schedule/:path*",
    "/profile/:path*",
  ],
};
