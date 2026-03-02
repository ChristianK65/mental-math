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
                // Transfer all training data from the anonymous user to the new account
                await prisma.attempt.updateMany({
                    where: { userId: anonymousUser.user.id },
                    data: { userId: newUser.user.id },
                });
                await prisma.userDomainProgress.updateMany({
                    where: { userId: anonymousUser.user.id },
                    data: { userId: newUser.user.id },
                });
            },
        }),
    ],
});