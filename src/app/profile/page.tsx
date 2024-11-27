import {
  LogoutLink,
} from '@kinde-oss/kinde-auth-nextjs/components';
export default function Profile() {


  return (
    <>
      <div className='bg-zinc-800 px-2 py-6 rounded-md mt-10 flex flex-col place-items-center'>
        <h1 className='text-center text-3xl font-bold'>Profile</h1>

        <LogoutLink className='border-red-500 border-2 rounded-md px-2 py-1 w-fit'>
          Logout
        </LogoutLink>
      </div>
    </>
  );
}
