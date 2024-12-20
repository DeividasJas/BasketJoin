'use client';
import { LogoutLink } from '@kinde-oss/kinde-auth-nextjs';
import { Button } from './ui/button';
export default function LogoutBtn() {
  return (
    <>
      <Button variant={'destructive'} className='w-fit mt-20 mx-auto'>
        <LogoutLink>Logout</LogoutLink>
      </Button>
    </>
  );
}
