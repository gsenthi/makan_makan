// A spinning square: ink frame with a red leading edge. Inherits nothing
// round from the old spinner, in keeping with the sharp-corner rule.
export default function LoadingSpinner({ small = false, light = false }) {
  const size = small ? 14 : 28;
  return (
    <div
      role="status"
      aria-label="Loading"
      style={{
        width: `${size}px`, height: `${size}px`, boxSizing: 'border-box',
        border: `${small ? 2 : 3}px solid ${light ? 'var(--bh-white)' : 'var(--bh-ink)'}`,
        borderTopColor: light ? 'var(--bh-yellow)' : 'var(--bh-red)',
        animation: 'bh-spin 0.9s linear infinite',
        flexShrink: 0,
      }}
    />
  );
}
