// Inline copies of the Tabler icons used by the shopping list flow
// (tabler.io/icons, MIT). Size and colour follow the parent's font-size and
// color, like the ti-* icon font would.
function TablerIcon({ children, size = '1em', strokeWidth = 2, style }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'block', ...style }}
    >
      {children}
    </svg>
  );
}

export function BasketIcon(props) {
  return (
    <TablerIcon {...props}>
      <path d="M10 14a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
      <path d="M5.001 8h13.999a2 2 0 0 1 1.977 2.304l-1.255 7.152a3 3 0 0 1 -2.966 2.544h-9.512a3 3 0 0 1 -2.965 -2.544l-1.255 -7.152a2 2 0 0 1 1.977 -2.304z" />
      <path d="M17 10l-2 -6" />
      <path d="M7 10l2 -6" />
    </TablerIcon>
  );
}

export function ArrowLeftIcon(props) {
  return (
    <TablerIcon {...props}>
      <path d="M5 12l14 0" />
      <path d="M5 12l6 6" />
      <path d="M5 12l6 -6" />
    </TablerIcon>
  );
}

export function XIcon(props) {
  return (
    <TablerIcon {...props}>
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </TablerIcon>
  );
}

export function ShareIcon(props) {
  return (
    <TablerIcon {...props}>
      <path d="M3 12a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
      <path d="M15 6a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
      <path d="M15 18a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
      <path d="M8.7 10.7l6.6 -3.4" />
      <path d="M8.7 13.3l6.6 3.4" />
    </TablerIcon>
  );
}

export function CheckIcon(props) {
  return (
    <TablerIcon {...props}>
      <path d="M5 12l5 5l10 -10" />
    </TablerIcon>
  );
}
