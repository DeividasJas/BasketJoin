import Image from "next/image";
import { addNewUser } from "@/actions/actions";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export default async function Home() {
  const {
    getUser,
    isAuthenticated: isAuth,
    getPermission,
  } = getKindeServerSession();


  const permissions = await getPermission('delete:game');
  console.log("Permissions: ", permissions);

  // const token = await getToken();
  const user = await getUser();
  const isAuthenticated = await isAuth();
  await addNewUser();

  // const { user:magic } = useKindeAuth();

  // const allGames = await getAllGames();

  // const { success, game, message } = await getLatestGameId();
  // if (success) {
  //   if (game) {
  //     console.log(game.id);
  //   }
  // } else {
  //   console.log(message);
  // }

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
        className="mx-auto w-full rounded-md sm:w-2/3 md:w-3/4"
        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
      />
    </>
  );
}
