/**
 * `/` is handled in `middleware.ts`: signed-in → `/home`, otherwise `/login`.
 * This component should not normally render.
 */
export default function RootPage() {
  return null;
}
