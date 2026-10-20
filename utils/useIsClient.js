import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// false on the server and during hydration, true once running in the browser
export default function useIsClient() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
