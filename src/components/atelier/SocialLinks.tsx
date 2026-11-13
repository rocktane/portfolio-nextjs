const networks = [
  {
    name: "GitHub",
    href: "https://github.com/rocktane",
    path: "M12 .8a11.2 11.2 0 0 0-3.54 21.83c.56.1.77-.24.77-.54v-2.1c-3.13.68-3.79-1.33-3.79-1.33-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.73 1.16 1.73 1.16 1 1.72 2.63 1.22 3.27.93.1-.73.4-1.22.71-1.5-2.5-.28-5.12-1.25-5.12-5.56 0-1.23.44-2.23 1.16-3.02-.12-.28-.5-1.43.11-2.98 0 0 .94-.3 3.08 1.15a10.7 10.7 0 0 1 5.6 0c2.14-1.45 3.08-1.15 3.08-1.15.61 1.55.23 2.7.11 2.98.72.79 1.16 1.79 1.16 3.02 0 4.32-2.63 5.28-5.14 5.56.4.35.76 1.03.76 2.07v3.1c0 .3.2.65.77.54A11.2 11.2 0 0 0 12 .8Z",
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/yohan-g",
    path: "M20.45 2H3.55C2.69 2 2 2.68 2 3.52v16.96c0 .84.69 1.52 1.55 1.52h16.9c.86 0 1.55-.68 1.55-1.52V3.52c0-.84-.69-1.52-1.55-1.52ZM7.93 18.74H4.98V9.2h2.95v9.54ZM6.46 7.9a1.71 1.71 0 1 1 0-3.42 1.71 1.71 0 0 1 0 3.42Zm12.28 10.84H15.8V14.1c0-1.1-.02-2.52-1.54-2.52-1.54 0-1.78 1.2-1.78 2.44v4.72H9.54V9.2h2.82v1.3h.04c.4-.75 1.36-1.54 2.79-1.54 2.98 0 3.55 1.96 3.55 4.51v5.27Z",
  },
];

export default function SocialLinks({
  compact = false,
}: {
  compact?: boolean;
}) {
  return (
    <nav
      className={`social-links${compact ? " social-links-compact" : ""}`}
      aria-label="Réseaux professionnels"
    >
      {networks.map(({ name, href, path }) => (
        <a
          key={name}
          href={href}
          aria-label={name}
          title={name}
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d={path} />
          </svg>
          <span>{name}</span>
        </a>
      ))}
    </nav>
  );
}
