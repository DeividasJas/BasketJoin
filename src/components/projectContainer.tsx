'use client';
import Header from './header';
import { useMediaQuery } from 'react-responsive';

export default function ProjectContainer({
  children,
}: {
  children: React.ReactNode;
}) {

  const isMobile = useMediaQuery({ minWidth: 768 })
  console.log(isMobile);
  


  return (
    <>
      <main className='bg-inherit min-h-screen w-auto max-w-[1100px] mx-auto  flex flex-col border'>
        {children}
      </main>
    </>
  );
}
