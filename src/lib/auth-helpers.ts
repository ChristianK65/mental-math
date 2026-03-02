/**
 * Returns true when `user` is an anonymous (guest) session user.
 * Usable on both client and server since it's not marked server-only.
 */
export function isAnonymousUser(user: unknown): boolean {
  return (user as { isAnonymous?: boolean } | undefined)?.isAnonymous === true;
}
