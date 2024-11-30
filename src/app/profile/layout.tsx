import type { Metadata } from 'next';
import ProfileNavList from '@/components/profileNavList';
import { ProfileProvider, useProfileContext } from '@/context/profileContext';

// type ProfileSections = {
//   general: string;
//   attendance: string;
//   stats: string;
//   settings: string;
//   notifications: string;
//   logout: string;
// };

type ProfileSection = {
  title: string;
  href: string;
};

const profileSections: ProfileSection[] = [
  {
    title: 'General',
    href: '/profile',
  },
  {
    title: 'Attendance',
    href: '/profile/attendance',
  },
  {
    title: 'Stats',
    href: '/profile/stats',
  },
  {
    title: 'Settings',
    href: '/profile/settings',
  },
  // {
  //   title: 'Notifications',
  //   href: '/profile/notifications',
  // },
];
export default function LayoutProfile({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ProfileProvider>
        <div className='bg-zinc-900 px-2 py-6 rounded-md mt-8 flex flex-col  place-items-center'>
          <ProfileNavList profileSections={profileSections} />
          {children}
        </div>
      </ProfileProvider>
    </>
  );
}
