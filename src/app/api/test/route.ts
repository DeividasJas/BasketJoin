import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server";

const { getUser, isAuthenticated } = getKindeServerSession();

// const user = await getUser();
// const isAuth = await isAuthenticated();

export async function GET() {
  try {
    console.log("TEST ROUTE");
    const { getUser, isAuthenticated } = getKindeServerSession();

    const authenticated = await isAuthenticated();

    const user = await getUser();
    console.log("USER", user);

    if (!authenticated || !user) {
      return NextResponse.json(
        {
          error: "Not authenticated",
          authenticated,
          user,
        },
        { status: 401 },
      );
    }

    // console.log(isAuth);
    // console.log(user);

    return NextResponse.json({ message: "yes" }, { status: 200 });
  } catch (error) {
    console.error(error.message);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 },
    );
  }
}
