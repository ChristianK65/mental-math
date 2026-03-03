import Link from "next/link";

import { AccountMenu } from "@/components/account-menu";
import { BrandMark } from "@/components/brand-mark";
import { isAnonymousUser } from "@/lib/auth-helpers";
import { getServerSession } from "@/lib/session";

export async function Navbar() {
  const session = await getServerSession();
  const isAnonymous = isAnonymousUser(session?.user);
  const isRegularUser = !!session && !isAnonymous;

  return (
    <header className="flex items-center justify-between">
      <Link className="flex items-center" href="/">
        <BrandMark />
      </Link>
      <div className="flex items-center gap-2 text-sm font-semibold">
        {isRegularUser ? (
          <AccountMenu />
        ) : (
          <>
            <Link
              className="rounded-full px-4 py-2 transition hover:bg-[#151515]/5"
              href="/login"
            >
              Log in
            </Link>
            <Link
              className="rounded-full bg-[#151515] px-4 py-2 text-white transition hover:bg-black"
              href="/signup"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
