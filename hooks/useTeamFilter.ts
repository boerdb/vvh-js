"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { VVH_TEAMS } from "@/lib/constants/teams";

export const ALL_TEAMS = "ALL";

export function useTeamFilter(options?: {
  allowAll?: boolean;
  defaultTeam?: string;
}) {
  const allowAll = options?.allowAll ?? true;
  const defaultTeam =
    options?.defaultTeam ?? (allowAll ? ALL_TEAMS : VVH_TEAMS[0].code);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const teamFilter = useMemo(() => {
    const raw = searchParams.get("team")?.toUpperCase() ?? "";
    if (allowAll && (raw === "" || raw === ALL_TEAMS)) return ALL_TEAMS;
    if (VVH_TEAMS.some((team) => team.code === raw)) return raw;
    return defaultTeam;
  }, [allowAll, defaultTeam, searchParams]);

  const setTeamFilter = useCallback(
    (code: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (allowAll && code === ALL_TEAMS) {
        params.delete("team");
      } else {
        params.set("team", code);
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [allowAll, pathname, router, searchParams]
  );

  return { teamFilter, setTeamFilter };
}
