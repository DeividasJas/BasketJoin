import Image from "next/image";
import { addNewUser } from "@/actions/actions";
import { getNextGamesDates } from "@/utils/gameTimeFunctions";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export default async function Home() {
  const {
    getUser,
    isAuthenticated: isAuth,
    getRoles,
  } = getKindeServerSession();
  const roles = await getRoles();
  console.log(roles, 111);

  // const token = await getToken();
  const user = await getUser();

  // console.log("user", user.role);

  const isAuthenticated = await isAuth();

  const newUser = await addNewUser();
  // console.log(newUser);

  getNextGamesDates();

  return (
    <>
      {isAuthenticated && (
        <h1 className="my-2 text-center text-xl">
          Welcome back {user.given_name} {user.family_name}
        </h1>
      )}
      <Image
        src={"/sabonis.gif"}
        width="500"
        height="500"
        alt="basketball"
        className="mx-auto rounded-md w-full sm:w-2/3 md:w-3/4"
        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
      />
    </>
  );
}
