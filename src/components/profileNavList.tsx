'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';
import { useEffect } from 'react';
import { getUserById } from '@/actions/actions';
// import { useProfileContext } from '@/context/profileContext';

export default function ProfileNavList({ profileSections }) {
  const pathname = usePathname();

  const { getUser, isLoading } = useKindeBrowserClient();
  const kindeUser = getUser();

  // const { profile, setProfile } = useProfileContext();
  // console.log(profile);

  useEffect(() => {
    // Wait until loading is false
    if (isLoading) {
      console.log('Still loading...');
      return;
    }

    if (!kindeUser) {
      console.log('kindeUser is not available');
      return;
    }

    // Fetch profile once loading is complete and kindeUser is valid
    const fetchProfile = async () => {
      try {
        const profile = await getUserById(kindeUser.id);
        console.log('after prisma', profile);
        if (profile.success) {
          // setProfile(profile.user);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    fetchProfile();
  }, [isLoading, kindeUser]); // Depend on isLoading and kindeUser

  return (
    <>
      <nav>
        <ul className='grid grid-cols-2 xs:grid-cols-4 gap-1 place-items-center'>
          {profileSections.map((link) => (
            <li
              key={link.href}
              className={`py-2 sm:py-2 rounded-md overflow-hidden w-full grid place-items-center ${
                pathname === link.href
                  ? 'border border-orange-600 text-orange-700'
                  : 'bg-zinc-800 '
              }`}
            >
              <Link href={link.href} className='truncate'>
                {link.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
