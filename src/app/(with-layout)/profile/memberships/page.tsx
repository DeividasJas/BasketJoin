import { getUserMemberships } from "@/actions/leagueMembershipActions";
import UserMembershipCard from "@/components/UserMembershipCard";
import { Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function MembershipsPage() {
  const { success, memberships } = await getUserMemberships();

  return (
    <section className="mt-6 flex h-full w-full max-w-[700px] flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">My League Memberships</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          View and manage your active league memberships
        </p>
      </div>

      {!success || memberships.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium">No memberships yet</h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Join a league to get started
          </p>
          <Link href="/leagues">
            <Button className="mt-4">Browse Available Leagues</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {memberships.map((membership) => (
            <UserMembershipCard key={membership.id} membership={membership} />
          ))}
        </div>
      )}
    </section>
  );
}
