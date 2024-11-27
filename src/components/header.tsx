import { navLinks } from '@/types/navLinks';
import Link from 'next/link';
import Image from 'next/image';
import NavLinkBox from './navLinkBox';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';

export default async function Header() {
  const { isAuthenticated: isAuthMethod } = getKindeServerSession();

  const isAuthenticated = await isAuthMethod();

  // console.log(isAuthenticated);

  const getFilteredLinks = () => {
    return navLinks.filter((link) => {
      if (link.label === 'Login' || link.label === 'Signup') {
        return !isAuthenticated;
      }
      if (link.label === 'Profile') return isAuthenticated;
      if (link.label === 'Logout') return isAuthenticated;
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
      <nav>
        <ul className='flex justify-around w-full py-2 border-t-2 border-zinc-800 rounded'>
          {getFilteredLinks().map((link) => (
            <NavLinkBox key={link.label} link={link} />
          ))}
        </ul>
      </nav>
    </header>
  );
}
