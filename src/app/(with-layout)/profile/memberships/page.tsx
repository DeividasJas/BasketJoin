import { getUserMemberships } from "@/actions/leagueMembershipActions";
import UserMembershipCard from "@/components/UserMembershipCard";
import Link from "next/link";

export default async function MembershipsPage() {
  const { success, memberships } = await getUserMemberships();

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div>
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500 dark:text-zinc-400">
          League Memberships
        </h2>
        <p className="mt-1 text-[13px] text-zinc-400 dark:text-zinc-500">
          View and manage your active memberships
        </p>
      </div>

      {!success || memberships.length === 0 ? (
        <div className="flex flex-col items-center py-12">
          <div className="mb-3 h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-700" />
          <p className="text-sm text-zinc-500">No memberships yet</p>
          <Link
            href="/leagues"
            className="mt-3 text-[13px] text-basket-400 transition-colors hover:text-basket-300"
          >
            Browse leagues
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {memberships.map((membership) => (
            <UserMembershipCard key={membership.id} membership={membership} />
          ))}
        </div>
      )}
    </div>
  );
}
