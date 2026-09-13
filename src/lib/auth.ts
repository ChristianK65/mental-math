import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { anonymous, username } from "better-auth/plugins";
import { and, eq, notInArray } from "drizzle-orm";

import { db } from "@/db";
import * as schema from "@/db/schema";
import { attempts, userDomainProgress } from "@/db/schema";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: {
            user: schema.users,
            session: schema.sessions,
            account: schema.accounts,
            verification: schema.verifications,
        },
    }),
    emailAndPassword: {
        enabled: true,
    },
    plugins: [
        username(),
        anonymous({
            onLinkAccount: async ({ anonymousUser, newUser }) => {
                // Transfer all attempt records 
                await db
                    .update(attempts)
                    .set({ userId: newUser.user.id })
                    .where(eq(attempts.userId, anonymousUser.user.id));

                // Only transfer domain progress for domains the new user doesn't
                // already have — a unique constraint on (userId, domain) means we
                // can't just transfer everything blindly.
                const existingProgress = await db
                    .select({ domain: userDomainProgress.domain })
                    .from(userDomainProgress)
                    .where(eq(userDomainProgress.userId, newUser.user.id));
                const existingDomains = existingProgress.map((p) => p.domain);

                if (existingDomains.length > 0) {
                    await db
                        .update(userDomainProgress)
                        .set({ userId: newUser.user.id, updatedAt: new Date() })
                        .where(
                            and(
                                eq(userDomainProgress.userId, anonymousUser.user.id),
                                notInArray(userDomainProgress.domain, existingDomains)
                            )
                        );
                    // Delete any conflicting anonymous progress that couldn't transfer
                    await db
                        .delete(userDomainProgress)
                        .where(eq(userDomainProgress.userId, anonymousUser.user.id));
                } else {
                    await db
                        .update(userDomainProgress)
                        .set({ userId: newUser.user.id, updatedAt: new Date() })
                        .where(eq(userDomainProgress.userId, anonymousUser.user.id));
                }
            },
        }),
    ],
});