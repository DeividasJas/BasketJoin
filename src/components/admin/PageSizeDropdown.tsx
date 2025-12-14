"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export default function PageSizeDropdown({ pageSize }: { pageSize: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams],
  );

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(
      `/dashboard/games?${createQueryString("pageSize", e.target.value)}`,
    );
  };

  return (
    <div className="flex items-center space-x-2">
      {/* <label htmlFor="pageSize" className="text-sm font-medium">
        Show
      </label> */}
      <select
        id="pageSize"
        value={pageSize}
        onChange={handlePageSizeChange}
        className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-800"
      >
        <option value={5}>5</option>
        <option value={10}>10</option>
        <option value={20}>20</option>
      </select>
      <span className="text-sm">per page</span>
    </div>
  );
}
