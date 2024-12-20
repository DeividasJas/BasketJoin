import { SinglePlayer } from "@/types/user";
import Image from "next/image";

export default function PlayerCard({ player }: { player: SinglePlayer }) {
  // console.log(player);

  return (
    <>
      <div className="mx-4 flex flex-col place-items-center">
        {player.picture ? (
          <Image
            src={player.picture}
            width={100}
            height={100}
            alt="Player picture"
            className="rounded-md"
          />
        ) : (
          <Image
            src={"/avatar.svg"}
            width={100}
            height={100}
            alt="Player picture"
          />
        )}
        <h5 className="mt-2 leading-none">
          {player.givenName} {player.familyName}
        </h5>
      </div>
    </>
  );
}
