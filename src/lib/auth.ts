import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { anonymous, username } from "better-auth/plugins";

import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
    },
    plugins: [
        username(),
        anonymous({
            onLinkAccount: async ({ anonymousUser, newUser }) => {
                // Transfer all attempt records 
                await prisma.attempt.updateMany({
                    where: { userId: anonymousUser.user.id },
                    data: { userId: newUser.user.id },
                });

                // Only transfer domain progress for domains the new user doesn't
                // already have — a @@unique([userId, domain]) constraint means we
                const existingProgress = await prisma.userDomainProgress.findMany({
                    where: { userId: newUser.user.id },
                    select: { domain: true },
                });
                const existingDomains = existingProgress.map((p) => p.domain);

                if (existingDomains.length > 0) {
                    await prisma.userDomainProgress.updateMany({
                        where: {
                            userId: anonymousUser.user.id,
                            domain: { notIn: existingDomains },
                        },
                        data: { userId: newUser.user.id },
                    });
                    // Delete any conflicting anonymous progress that couldn't transfer
                    await prisma.userDomainProgress.deleteMany({
                        where: { userId: anonymousUser.user.id },
                    });
                } else {
                    await prisma.userDomainProgress.updateMany({
                        where: { userId: anonymousUser.user.id },
                        data: { userId: newUser.user.id },
                    });
                }
            },
        }),
    ],
});