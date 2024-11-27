import { Links } from '@/types/navLinks';
import Link from 'next/link';
import {
  RegisterLink,
  LoginLink,
} from '@kinde-oss/kinde-auth-nextjs/components';

export default function NavLinkBox({
  //   children,
  link,
}: {
  //   children: ReactNode;
  link: Links;
}) {
  // console.log(link);

  return (
    <li className='bg-zinc-800 px-3 py-2 sm:px-4 sm:py-3 rounded-md '>
      {link.href ? (
        <Link href={link.href}>{link.label}</Link>
      ) : link.label === 'Login' ? (
        <LoginLink>{link.label}</LoginLink>
      ) : (
        <RegisterLink>{link.label}</RegisterLink>
      )}
      {/* <Link href={link.href}>{link.label}</Link> */}
    </li>
  );
}
