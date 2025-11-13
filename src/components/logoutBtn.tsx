'use client';
import { signOut } from 'next-auth/react';
import { Button } from './ui/button';

export default function LogoutBtn() {
  return (
    <Button
      variant={'destructive'}
      className='w-fit mt-20 mx-auto'
      onClick={() => signOut({ callbackUrl: '/schedule' })}
    >
      Logout
    </Button>
  );
}
