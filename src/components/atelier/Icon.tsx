import type { SVGProps } from "react";
const paths = {
  panel: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M10 4v16" />
      <path d="M5 6h3v12H5Z" fill="currentColor" stroke="none" />
    </>
  ),
  briefcase: (
    <>
      <rect x="3" y="7" width="18" height="14" rx="2" />
      <path d="M8 7V4h8v3M3 12a23 23 0 0 0 18 0M10 13h4" />
    </>
  ),
  graduation: (
    <>
      <path d="m2 9 10-6 10 6-10 6ZM6 12v6c4 3 8 3 12 0v-6M22 9v8" />
    </>
  ),
  table: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M3 15h18M9 3v18" />
    </>
  ),
  filter: <path d="M4 6h16M7 12h10M10 18h4" />,
  sort: (
    <>
      <path d="M8 4v16m-4-4 4 4 4-4M16 20V4m-4 4 4-4 4 4" />
    </>
  ),
  sliders: (
    <>
      <path d="M3 6h4m4 0h10M3 18h10m4 0h4" />
      <circle cx="9" cy="6" r="2" />
      <circle cx="15" cy="18" r="2" />
    </>
  ),
  heart: (
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
  ),
  kanban: (
    <>
      <rect x="3" y="3" width="5" height="15" rx="1" />
      <rect x="10" y="3" width="5" height="10" rx="1" />
      <rect x="17" y="3" width="4" height="18" rx="1" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
    </>
  ),
  moon: <path d="M20 14A8.5 8.5 0 0 1 10 4a8.5 8.5 0 1 0 10 10Z" />,
  monitor: (
    <>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M12 17v4M8 21h8" />
    </>
  ),
  gamepad: (
    <>
      {/* Lucide gamepad (ISC), see public/licenses/lucide.txt. */}
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <path d="M6 12h4m-2-2v4M15 13h.01M18 11h.01" />
    </>
  ),
  play: <path d="m8 4 12 8-12 8Z" />,
  home: <path d="m3 10 9-7 9 7v11h-6v-7H9v7H3Z" />,
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  list: <path d="M8 5h13M8 12h13M8 19h13M3 5h.1M3 12h.1M3 19h.1" />,
  flask: (
    <path d="M9 3h6m-5 0v6l-6 10a1 1 0 0 0 1 2h14a1 1 0 0 0 1-2L14 9V3M7 15h10" />
  ),
  route: (
    <>
      <circle cx="6" cy="5" r="2" />
      <circle cx="18" cy="19" r="2" />
      <path d="M6 7v6a4 4 0 0 0 4 4h4M11 5h5a3 3 0 0 1 0 6h-2" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 6 9 7 9-7" />
    </>
  ),
  code: <path d="m7 7-5 5 5 5m10-10 5 5-5 5M14 4l-4 16" />,
  chart: <path d="M4 4v16h16M7 15l4-5 3 3 5-7" />,
  search: (
    <>
      <circle cx="10" cy="10" r="6" />
      <path d="m15 15 5 5" />
    </>
  ),
  arrow: <path d="M5 19 19 5M7 5h12v12" />,
  download: <path d="M12 3v12m-5-5 5 5 5-5M4 20h16" />,
  back: <path d="M20 12H4m6-6-6 6 6 6" />,
  archive: (
    <>
      <path d="M4 8v13h16V8M9 12h6" />
      <rect x="2" y="3" width="20" height="5" rx="1" />
    </>
  ),
  edit: (
    <>
      <path d="m15 4 5 5M4 20l5-1L21 7a2 2 0 0 0-5-5L4 14Z" />
    </>
  ),
  sidebar: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <path d="M9.5 4v16" />
      <path className="sidebar-chevron" d="m16 10-2 2 2 2" />
    </>
  ),
  file: (
    <>
      <path d="M14 2H5v20h14V7ZM14 2v6h5M8 12h8M8 16h8" />
    </>
  ),
} as const;
export type IconName = keyof typeof paths;
export default function Icon({
  name,
  ...props
}: SVGProps<SVGSVGElement> & { name: IconName }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
