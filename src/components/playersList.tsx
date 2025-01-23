"use client";

import { getLatestGameByLocation } from "@/actions/gameActions";
import PlayerCard from "./playerCard";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect, Fragment } from "react";
import { CancelRegistrationBtn } from "./cancelRegistrationBtn";
import RegistrationBtn from "./registrationBtn";
import { latestGameByLocation } from "@/types/user";

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
  latestGameWithPLayers,
}: {
  latestGameWithPLayers: latestGameByLocation;
}) {
  const [change, setChange] = useState(false);
  const [players, setPlayers] = useState(
    latestGameWithPLayers?.participants || [],
  );
  const [isActive, setIsPlaying] = useState(latestGameWithPLayers?.isActive);
  const [game, setGame] = useState(latestGameWithPLayers?.game);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      const { success, latestGameWithPLayers } =
        await getLatestGameByLocation(1);

      try {
        if (success && latestGameWithPLayers) {
          setPlayers(latestGameWithPLayers.participants);
          setIsPlaying(latestGameWithPLayers.isActive);
          setGame(latestGameWithPLayers.game);
        } else {
          return <div>Failed to load players</div>;
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [change]);

  return (
    <>
      {isLoading ? (
        <p>Loading players...</p>
      ) : (
        <motion.ul
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 gap-4 sm:grid-cols-3"
        >
          <AnimatePresence>
            {players.map((player, index) => {
              // Check if this is a special index where you want to insert a full-width label
              if (index === 1 || index === 2) {
                return (
                  <Fragment key={index}>
                    <motion.li
                      key={`label-${index}`}
                      className="col-span-2 sm:col-span-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <p
                        className={`border-t ${
                          index === 1 ? "border-orange-600" : "border-red-600"
                        } text-center`}
                      >
                        {index === 1 ? "12 players" : "14 players"}
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
      <div className="mt-4 flex flex-wrap gap-2 xs:flex-nowrap">
        <RegistrationBtn setChange={setChange} isActive={isActive} gameId={game.game_id}/>

        <CancelRegistrationBtn
          setChange={setChange}
          game={game!}
          isActive={isActive!}
        />
      </div>
    </>
  );
}
