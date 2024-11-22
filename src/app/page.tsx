import Image from 'next/image';

import {
  RegisterLink,
  LoginLink,
} from '@kinde-oss/kinde-auth-nextjs/components';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';

import { getUsers } from '@/actions/actions';

export default async function Home() {
  const { getUser, isAuthenticated } = getKindeServerSession();
  const user = await getUser();
  const isauthenticated = await isAuthenticated();
  // console.log(isauthenticated, 1111);

  // console.log(user);

  // const users = await getUsers();
  // console.log(users);

  return (
    <>
      {/* <LoginLink className=' m-2 px-2 py-1 rounded-sm border-4 font-semibold max-w-[50px] max-h-[50px] '>
        Sign in
      </LoginLink>
      <RegisterLink className=' m-2 px-2 py-1 rounded-sm border-4 font-semibold max-w-[50px] max-h-[50px] '>
        Sign up
      </RegisterLink> */}
      {isauthenticated && (
        <h1>
          Welcome back {user.given_name} {user.family_name}
        </h1>
      )}
      <Image
        src={'/sabonis.gif'}
        width='0'
        height='0'
        alt='basketball'
        className='mx-auto w-full sm:w-2/3 rounded-md'
      />
    </>
  );
}
