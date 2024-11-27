import { KindeUser } from '@/types/user';
import { User } from '@prisma/client';



export default function changeKindeUser(user: KindeUser): Omit<User, 'posts' | 'gameRegistrations'> {
  return {
    id: user.id,
    email: user.email,
    familyName: user.family_name,
    givenName: user.given_name,
    picture: user.picture ?? null,
    username: null, // Change to null to match schema
    phoneNumber: user.phone_number ?? null, // Change to null
    createdAt: new Date(),
    modifiedAt: new Date(),
  };
}