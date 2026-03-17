"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function TrainAgainShortcut({ href }: { href: string }) {
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Enter") {
        e.preventDefault();
        router.push(href);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [href, router]);

  return null;
}
