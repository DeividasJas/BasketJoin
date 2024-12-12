import Image from "next/image";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { addNewUser, allUsers } from "@/actions/actions";
import { getNextGamesDates } from "@/utils/gameTimeFunctions";

export default async function Home() {
  const { getUser, isAuthenticated: isAuth } = getKindeServerSession();
  const user = await getUser();
  const isAuthenticated = await isAuth();

  // const newUser = await addNewUser();
  // console.log(newUser);


  getNextGamesDates()


  return (
    <>
      {isAuthenticated && (
        <h1>
          Welcome back {user.given_name} {user.family_name}
        </h1>
      )}
      <Image
        src={"/sabonis.gif"}
        width="0"
        height="0"
        alt="basketball"
        className="mx-auto w-full rounded-md sm:w-2/3"
      />
    </>
  );
}
