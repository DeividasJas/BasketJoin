import { PrismaClient } from '@prisma/client';
// import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';

const prisma = new PrismaClient();

export const getUsers = async () => {
  const users = await prisma.user.findMany();
  return users;
};

// export const isAuthenticated = async () => {
//   const { isAuthenticated } = getKindeServerSession();

//   console.log(isAuthenticated);
  
//   return isAuthenticated;
// };
