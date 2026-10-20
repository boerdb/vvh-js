"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { VVH_TEAMS, type TeamOption } from "@/lib/constants/teams";
import { useMyTeam } from "@/hooks/useMyTeam";

export const ALL_TEAMS = "ALL";

export function useTeamFilter(options?: {
  allowAll?: boolean;
  defaultTeam?: string;
  teams?: TeamOption[];
}) {
  const teams = options?.teams ?? VVH_TEAMS;
  const allowAll = options?.allowAll ?? true;
  const { myTeam } = useMyTeam();
  const myTeamListed = myTeam && teams.some((team) => team.code === myTeam);
  const defaultTeam =
    options?.defaultTeam ??
    (myTeamListed ? myTeam : allowAll ? ALL_TEAMS : teams[0].code);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const teamFilter = useMemo(() => {
    const raw = searchParams.get("team")?.toUpperCase() ?? "";
    if (allowAll && raw === ALL_TEAMS) return ALL_TEAMS;
    if (teams.some((team) => team.code === raw)) return raw;
    return defaultTeam;
  }, [allowAll, defaultTeam, searchParams, teams]);

  const setTeamFilter = useCallback(
    (code: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (code === defaultTeam) {
        params.delete("team");
      } else {
        // Ook "ALL" expliciet in de URL als Mijn team de standaard is.
        params.set("team", code);
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [defaultTeam, pathname, router, searchParams]
  );

  return { teamFilter, setTeamFilter };
}
