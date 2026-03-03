/**
 * Returns true when `user` is an anonymous (guest) session user.
 */
export function isAnonymousUser(user: unknown): boolean {
  return (user as { isAnonymous?: boolean } | undefined)?.isAnonymous === true;
}
