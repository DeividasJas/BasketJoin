import Image from "next/image";
import { addNewUser } from "@/actions/userActions";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export default async function Home() {
  const { getUser, isAuthenticated: isAuth } = getKindeServerSession();
  const user = await getUser();
  const isAuthenticated = await isAuth();
  await addNewUser();

  return (
    <>
      {isAuthenticated && (
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
