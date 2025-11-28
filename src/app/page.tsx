import Image from "next/image";
import { auth } from "@/auth";
import { getCurrentUser } from "@/actions/userActions";

export default async function Home() {
  const session = await auth();
  const isAuthenticated = !!session?.user;

  let user = null;
  if (session?.user?.id) {
    user = await getCurrentUser();
  }

  return (
    <>
      {isAuthenticated && user && (
        <h1 className="my-2 text-center text-xl">
          Welcome back {user.given_name} {user.family_name}
        </h1>
      )}
      <h3 className="text-center">Some features still in development</h3>

      <Image
        src={"/sabonis.gif"}
        width="500"
        height="500"
        alt="basketball"
        priority={true}
        className="mx-auto w-full rounded-md sm:w-2/3 md:w-3/4"
        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
      />
    </>
  );
}
