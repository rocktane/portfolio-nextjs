import type { MouseEvent } from "react";
/** Static exports can hydrate a query while Next's cached canonical URL is bare.
 * Handle a same-collection reset explicitly; other links keep normal Next navigation.
 */
export function resetCollectionQuery(event: MouseEvent<HTMLAnchorElement>) {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  )
    return;
  const target = new URL(event.currentTarget.href);
  if (
    target.origin === location.origin &&
    target.pathname === location.pathname &&
    !target.search &&
    location.search
  ) {
    event.preventDefault();
    window.history.pushState(null, "", target.pathname);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
}
