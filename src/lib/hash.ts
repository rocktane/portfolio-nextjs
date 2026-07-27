/**
 * L'ancre de l'URL comme source de vérité de la fiche ouverte.
 *
 * `replaceState` n'émet pas d'événement `hashchange` : on tient donc notre
 * propre liste d'abonnés, ce qui permet à React de s'abonner à l'URL via
 * `useSyncExternalStore` plutôt que de dupliquer l'état.
 */
const listeners = new Set<() => void>();

export function setHash(id: string | null) {
  const url = id ? `#${id}` : window.location.pathname;
  window.history.replaceState(null, "", url);
  listeners.forEach((notify) => notify());
}

export function subscribeToHash(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("hashchange", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("hashchange", onChange);
  };
}

export const getHash = () => window.location.hash.slice(1);

/** Au rendu serveur il n'y a pas d'URL côté client : aucune fiche ouverte. */
export const getServerHash = () => "";
