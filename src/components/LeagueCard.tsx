"use client";

import Link from "next/link";
import { Calendar, MapPin, Users, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/paymentUtils";

type LeagueCardProps = {
  league: {
    id: string;
    name: string;
    status: string;
    start_date: Date;
    end_date: Date;
    gym_rental_cost: number;
    guest_fee_per_game: number;
    location: {
      name: string;
      city: string;
    };
    _count: {
      memberships: number;
      games: number;
    };
  };
};

export default function LeagueCard({ league }: LeagueCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "UPCOMING":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "ACTIVE":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "COMPLETED":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Link href={`/leagues/${league.id}`} className="group">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold group-hover:text-orange-600 dark:group-hover:text-orange-400">
              {league.name}
            </h3>
          </div>
          <span
            className={`ml-2 inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(league.status)}`}
          >
            {league.status}
          </span>
        </div>

        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>
              {league.location.name}, {league.location.city}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>
              {new Date(league.start_date).toLocaleDateString()} -{" "}
              {new Date(league.end_date).toLocaleDateString()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>
              {league._count.memberships} members • {league._count.games} games
            </span>
          </div>

          <div className="mt-4 border-t border-gray-200 pt-3 dark:border-gray-700">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <span className="font-medium">Membership:</span>
              </div>
              <span className="font-semibold">
                {formatCurrency(league.gym_rental_cost)}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between text-sm">
              <span className="text-xs">Guest fee per game:</span>
              <span className="text-xs font-medium">
                {formatCurrency(league.guest_fee_per_game)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
