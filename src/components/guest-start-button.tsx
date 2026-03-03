"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";

export function GuestStartButton() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    async function handleClick() {
        setError(null);
        try {
            const session = await authClient.getSession();
            if (session.data) {
                router.push("/dashboard");
                return;
            }
            const result = await authClient.signIn.anonymous();
            if (!result.error) {
                router.push("/dashboard");
                router.refresh();
            } else {
                setError(result.error.message ?? "Something went wrong.");
            }
        } catch (err) {
            console.error("[GuestStartButton]", err);
            setError("Something went wrong.");
        }
    }

    return (
        <div className="flex flex-col items-center gap-2">
            <button
                className="inline-flex items-center justify-center rounded-full bg-[#151515] px-10 py-4 text-base font-semibold text-white transition hover:bg-black"
                onClick={handleClick}
            >
                Start training
            </button>
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}
