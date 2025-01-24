import Image from "next/image";
import { Users } from "@prisma/client";

export default function PlayerCard({ player }: { player: Users }) {
  return (
    <>
      <div className="mx-4 mb-3 flex flex-col place-items-center">
        {player.picture ? (
          <Image
            src={player.picture}
            width={100}
            height={100}
            priority={true}
            alt="Player picture"
            className="rounded-md"
          />
        ) : (
          <Image
            src={"/avatar.svg"}
            width={100}
            height={100}
            priority={true}
            alt="Player avatar"
          />
        )}
        <h5 className="mt-2 leading-none">
          {player.given_name && player.given_name}{" "}
          {player.family_name && player.family_name}
        </h5>
      </div>
    </>
  );
}
