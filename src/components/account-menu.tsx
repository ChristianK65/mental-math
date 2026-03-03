"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { authClient } from "@/lib/auth-client";
import { isAnonymousUser } from "@/lib/auth-helpers";

export function AccountMenu() {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { data: session } = authClient.useSession();
  const isAnonymous = isAnonymousUser(session?.user);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    const { error } = await authClient.signOut();

    if (!error) {
      router.push("/");
      router.refresh();
      return;
    }

    setIsSigningOut(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        className="inline-flex size-10 items-center justify-center rounded-full border border-[#151515]/20 bg-white/80 transition hover:border-[#151515]/40"
        aria-label="Open account menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <svg
          className="size-5 text-[#151515]"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4 7h16M4 12h16M4 17h16"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {isOpen ? (
        <div className="absolute right-0 z-20 mt-2 w-52 rounded-2xl border border-[#151515]/10 bg-white p-2 shadow-[0_12px_30px_rgba(21,21,21,0.15)]">
          {isAnonymous ? (
            <>
              <p className="px-3 py-2 text-xs text-[#151515]/50">
                Guest session — progress won't be saved permanently.
              </p>
              <Link
                href="/signup"
                className="mt-1 block w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-[#151515]/85 transition hover:bg-[#151515]/5"
                onClick={() => setIsOpen(false)}
              >
                Create account
              </Link>
              <Link
                href="/login"
                className="mt-1 block w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-[#151515]/85 transition hover:bg-[#151515]/5"
                onClick={() => setIsOpen(false)}
              >
                Sign in
              </Link>
            </>
          ) : (
            <button
              type="button"
              className="block w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-[#151515]/45"
              disabled
            >
              Settings
            </button>
          )}
          <button
            type="button"
            className="mt-1 block w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-[#151515]/85 transition hover:bg-[#151515]/5"
            onClick={handleSignOut}
            disabled={isSigningOut}
          >
            {isSigningOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
