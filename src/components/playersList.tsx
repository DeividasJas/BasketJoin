'use client';

import { latestGameAndPlayers } from '@/actions/actions';
import PlayerCard from './playerCard';
import { AnimatePresence, motion } from 'framer-motion';
import { useState, useEffect, Fragment } from 'react';
import { CancelRegistrationBtn } from './cancelRegistrationBtn';
import RegistrationBtn from './registrationBtn';
import { GameAndPlayers, LatestGame } from '@/types/user';
import { IsPlaying } from '@/types/user';

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
  gameAndPlayers,
}: {
  gameAndPlayers: GameAndPlayers;
}) {
  const [players, setPlayers] = useState(gameAndPlayers.participants);
  const [latestGame, setLatestGame] = useState<LatestGame>(
    gameAndPlayers.latestGame
  );
  const [isActive, setIsPlaying] = useState<IsPlaying>(gameAndPlayers.isActive);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [change, setChange] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const data = await latestGameAndPlayers();

      try {
        if (data.success) {
          setPlayers(data.participants);
          setIsPlaying(data.isActive);
          setLatestGame(data.latestGame);
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

  if (isLoading) return <p>Loading players...</p>;
  return (
    <>
      <motion.ul
        initial='hidden'
        animate='visible'
        className='grid grid-cols-2 sm:grid-cols-3 gap-4'
      >
        <AnimatePresence>
          {players.map((player, index) => {
            // Check if this is a special index where you want to insert a full-width label
            if (index === 1 || index === 2) {
              return (
                <Fragment key={index}>
                  <motion.li
                    key={`label-${index}`}
                    className='col-span-2 sm:col-span-3'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <p
                      className={`border-t ${
                        index === 1 ? 'border-orange-600' : 'border-red-600'
                      } text-center`}
                    >
                      {index === 1 ? '12 players' : '14 players'}
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
                initial='hidden'
                animate='visible'
                exit='hidden'
              >
                <PlayerCard player={player} />
              </motion.li>
            );
          })}
        </AnimatePresence>
      </motion.ul>

      <div className='flex gap-1 flex-wrap xs:flex-nowrap mt-4'>
        <RegistrationBtn setChange={setChange} isActive={isActive} />

        <CancelRegistrationBtn
          setChange={setChange}
          // gameAndPlayers={gameAndPlayers}
          latestGame={latestGame}
          // change={change}
          isActive={isActive}
        />
      </div>
    </>
  );
}
