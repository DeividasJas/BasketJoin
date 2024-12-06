import { useProfileContext } from "@/context/profileContext";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export default async function Profile({stats}: {stats: React.ReactNode}) {
  const { getUser } = getKindeServerSession();

  const user = await getUser()


    console.log(user);
    

  
  return (
    <>
      <section className=''>
        <h1 className='text-center text-3xl font-bold mt-2 '>Profile</h1>
        <div className='bg-zinc-800  px-2 py-6 rounded-md mt-4 w-full'>

          {user?.family_name}

        <div className="border-4 border-red-500">{stats}</div>

        </div>
      </section>
    </>
  );
}
