'use client';
import { navLinks } from '@/types/navLinks';
import { User } from '@/types/user';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  RegisterLink,
  LoginLink,
  LogoutLink,
} from '@kinde-oss/kinde-auth-nextjs/components';
import { useEffect, useState } from 'react';

// import { motion } from 'motion/react';

import NavLinkBox from './navLinkBox';
import { li } from 'framer-motion/client';
export default function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  // const [user, setUser] = useState<User | null>(null);

  // const pathname = usePathname();
  // const isauthenticated = isAuthenticated();
  // console.log(isauthenticated);

  useEffect(() => {
    const checkAuthGetUser = async () => {
      try {
        const response = await fetch('/api');
        const isAuth = await response.json();
        // returns true or false
        setIsAuthenticated(isAuth);
      } catch (error) {
        console.error('Error fetching API:', error);
      }
    };
    checkAuthGetUser();
  }, []);

  const getFilteredLinks = () => {
    return navLinks.filter((link) => {
      if (link.label === 'Login' || link.label === 'Signup')
        return !isAuthenticated;
      if (link.label === 'Profile') return isAuthenticated;
      return true;
    });
  };

  return (
    <header className='order-last sm:order-first'>
      <Link href='/'>
        <Image
          src={'/basketball.svg'}
          width='40'
          height='40'
          alt='basketball'
          className='m-3'
        />
      </Link>
      <nav className=''>
        <ul className='flex justify-around w-full py-2 border-t-2 border-zinc-800 rounded'>
          {}
          {getFilteredLinks().map((link) => (
            <NavLinkBox key={link.label} link={link} />
          ))}
        </ul>
      </nav>
    </header>
  );
}
