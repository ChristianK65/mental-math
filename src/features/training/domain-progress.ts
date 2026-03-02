import type { Domain } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

import { ORDERED_DOMAINS } from "@/features/training/domain-config";

export type DomainLevel = {
  domain: Domain;
  currentLevel: number;
  highestUnlockedLevel: number;
};

export async function getUserDomainLevels(userId: string): Promise<DomainLevel[]> {
  const progressRows = await prisma.userDomainProgress.findMany({
    where: {
      userId,
      domain: { in: ORDERED_DOMAINS },
    },
    select: {
      domain: true,
      currentLevel: true,
      highestUnlockedLevel: true,
    },
  });

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
