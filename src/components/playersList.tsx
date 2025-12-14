"use client";

import { useState, useEffect, Fragment } from "react";
import { getGameByIdAndLocation } from "@/actions/gameActions";
import PlayerCard from "./playerCard";
import { AnimatePresence, motion } from "framer-motion";
import { CancelRegistrationBtn } from "./cancelRegistrationBtn";
import RegistrationBtn from "./registrationBtn";
import { toast } from "sonner";
import {
  // Game,
  IsActivePlayer,
  Players,
} from "@/types/prismaTypes";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: index * 0.1,
    },
  }),
};

export default function PlayersList({
  gameId,
  isLoggedIn,
  // gameData,
  isActivePlayer,
  participantsData,
}: {
  gameId: number;
  isLoggedIn?: boolean;
  // gameData: Game;
  isActivePlayer: IsActivePlayer;
  participantsData: Players;
}) {
  const [change, setChange] = useState(false);
  // const [game, setGame] = useState<Game>(gameData);
  const [players, setPlayers] = useState<Players>(participantsData);
  const [isActive, setIsPlaying] = useState<IsActivePlayer>(isActivePlayer);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const {
          success,
          participantsData,
          isActivePlayer,
          // gameData
        } = await getGameByIdAndLocation(gameId);
        if (!success) {
          return <div>Failed to load players</div>;
        } else {
          setPlayers(participantsData);
          setIsPlaying(isActivePlayer);
          // setGame(gameData);
        }
      } catch (error) {
        toast.error("Failed to load players");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [change, gameId]);

  return (
    <>
      {isLoading ? (
        <p className="text-center">Loading players...</p>
      ) : (
        <motion.ul
          initial="hidden"
          animate="visible"
          className="flex flex-wrap justify-center"
        >
          <AnimatePresence>
            {players &&
              players.map((player, index) => {
                // Check if this is a special index where you want to insert a full-width label
                if (index === 10 || index === 12) {
                  return (
                    <Fragment key={index}>
                      <motion.li
                        key={`label-${index}`}
                        className="w-full basis-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <p
                          className={`mb-4 mt-2 w-full basis-full border-t pt-2 text-center ${index === 10 ? "border-orange-600" : "border-red-600"}`}
                        >
                          {index === 10 ? "10 players" : "12 players"}
                        </p>
                      </motion.li>
                      <motion.li>
                        <PlayerCard player={player} />
                      </motion.li>
                    </Fragment>
                  );
                }

                return (
                  <motion.li
                    key={player.id}
                    custom={index}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                    <PlayerCard player={player} />
                  </motion.li>
                );
              })}
          </AnimatePresence>
        </motion.ul>
      )}
      <div className="mx-auto mt-4 flex w-fit flex-wrap gap-2 xs:flex-nowrap">
        <RegistrationBtn
          setChange={setChange}
          isActive={isActive}
          gameId={gameId}
          disabled={!isLoggedIn}
        />

        <CancelRegistrationBtn
          setChange={setChange}
          isActive={isActive}
          gameId={gameId}
        />
      </div>
    </>
  );
}
