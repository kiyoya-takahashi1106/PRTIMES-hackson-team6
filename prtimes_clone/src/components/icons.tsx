import type { SVGProps } from "react";

const base = (props: SVGProps<SVGSVGElement>) => ({
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...props,
});

export const IconDashboard = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

export const IconDocument = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <rect x="4" y="3" width="16" height="18" rx="1.5" />
    <path d="M8 8h8M8 12h8M8 16h5" />
  </svg>
);

export const IconMediaList = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <rect x="3" y="4" width="18" height="16" rx="1.5" />
    <path d="M3 9h18M8 9v11" />
  </svg>
);

export const IconStory = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H12v18H6.5A2.5 2.5 0 0 1 4 18.5z" />
    <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H12v18h5.5a2.5 2.5 0 0 0 2.5-2.5z" />
  </svg>
);

export const IconAnalytics = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <path d="M4 19V9M12 19V4M20 19v-6" />
  </svg>
);

export const IconClipping = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <path d="M9 3h6a2 2 0 0 1 2 2v13a3 3 0 1 1-6 0V6" />
    <path d="M9 8h4" />
  </svg>
);

export const IconCompany = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <rect x="4" y="3" width="10" height="18" rx="1" />
    <rect x="14" y="8" width="6" height="13" rx="1" />
    <path d="M7 7h4M7 11h4M7 15h4" />
  </svg>
);

export const IconSettings = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H9a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V9a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1z" />
  </svg>
);

export const IconChevronRight = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)} width={14} height={14}>
    <path d="M9 6l6 6-6 6" />
  </svg>
);

export const IconChevronDown = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)} width={14} height={14}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);

export const IconPhone = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)} width={16} height={16}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.68 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.32 1.85.55 2.81.68A2 2 0 0 1 22 16.92z" />
  </svg>
);

export const IconMail = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)} width={16} height={16}>
    <path d="M4 4h16v16H4z" />
    <path d="M4 6l8 7 8-7" />
  </svg>
);

export const IconBell = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

export const IconUser = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)} strokeWidth={1.5}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="10" r="3" />
    <path d="M6.5 19a6 6 0 0 1 11 0" />
  </svg>
);

export const IconSearch = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)} width={16} height={16}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </svg>
);

export const IconCopy = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)} width={14} height={14}>
    <rect x="9" y="9" width="12" height="12" rx="1.5" />
    <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
  </svg>
);

export const IconClose = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)} width={16} height={16}>
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);
