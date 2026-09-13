import { and, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import { userDomainProgress, type Domain } from "@/db/schema";
import { ORDERED_DOMAINS } from "@/features/training/domain-config";

export type DomainLevel = {
  domain: Domain;
  currentLevel: number;
  highestUnlockedLevel: number;
};

export async function getUserDomainLevels(userId: string): Promise<DomainLevel[]> {
  const progressRows = await db
    .select({
      domain: userDomainProgress.domain,
      currentLevel: userDomainProgress.currentLevel,
      highestUnlockedLevel: userDomainProgress.highestUnlockedLevel,
    })
    .from(userDomainProgress)
    .where(
      and(
        eq(userDomainProgress.userId, userId),
        inArray(userDomainProgress.domain, ORDERED_DOMAINS),
      ),
    );

  const progressByDomain = new Map(progressRows.map((row) => [row.domain, row]));

  return ORDERED_DOMAINS.map((domain) => {
    const row = progressByDomain.get(domain);
    return {
      domain,
      currentLevel: row?.currentLevel ?? 1,
      highestUnlockedLevel: row?.highestUnlockedLevel ?? 1,
    };
  });
}
