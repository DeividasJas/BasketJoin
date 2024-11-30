'use client';
import { LogoutLink } from '@kinde-oss/kinde-auth-nextjs';
import { Button } from './ui/button';
export default function LogoutBtn() {
  return (
    <>
      <Button className='border-red-500 border-2 rounded-md px-2 py-1 w-fit'>
        <LogoutLink>Logout</LogoutLink>
      </Button>
    </>
  );
}
