// Shared pieces of the Itten / Bauhaus design. Colours reference the CSS
// custom properties in index.css.
export const C = {
  paper: 'var(--bh-paper)',
  white: 'var(--bh-white)',
  ink: 'var(--bh-ink)',
  red: 'var(--bh-red)',
  yellow: 'var(--bh-yellow)',
  blue: 'var(--bh-blue)',
  grey: 'var(--bh-grey)',
  muted: 'var(--bh-muted)',
  rule: 'var(--bh-rule)',
};

export const BORDER = `2px solid ${C.ink}`;

const PRIMARIES = [C.red, C.yellow, C.blue];

// Cycles red → yellow → blue by index.
export function primaryAt(index) {
  return PRIMARIES[index % 3];
}

// Legible text colour on top of primaryAt(index).
export function inkOnPrimary(index) {
  return index % 3 === 1 ? C.ink : C.white;
}

// Red header with Itten's yellow circle and blue triangle behind the content.
export function BauhausHeader({ children }) {
  return (
    <div style={{ position: 'relative', overflow: 'hidden', background: C.red, padding: '24px 18px 20px', borderBottom: `4px solid ${C.ink}` }}>
      <div aria-hidden style={{
        position: 'absolute', top: '-18px', right: '-18px', width: '90px', height: '90px',
        borderRadius: '50%', background: C.yellow, border: `3px solid ${C.ink}`, zIndex: 0,
      }} />
      <div aria-hidden style={{
        position: 'absolute', bottom: '-1px', right: '30px', width: 0, height: 0,
        borderLeft: '22px solid transparent', borderRight: '22px solid transparent',
        borderBottom: `38px solid ${C.blue}`, zIndex: 0,
      }} />
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );
}

export function TricolourStripe() {
  return (
    <div aria-hidden className="flex" style={{ height: '5px', boxSizing: 'content-box', borderBottom: BORDER }}>
      <div style={{ flex: 4, background: C.red }} />
      <div style={{ flex: 2, background: C.yellow, borderLeft: BORDER, borderRight: BORDER }} />
      <div style={{ flex: 3, background: C.blue }} />
    </div>
  );
}

export function Eyebrow({ children, style }) {
  return (
    <p style={{ fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.65)', margin: '0 0 6px', ...style }}>
      {children}
    </p>
  );
}

// Text-style button used for "← Back" on light pages.
export const backButtonStyle = {
  fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
  color: C.ink, background: 'none', border: 'none', cursor: 'pointer', padding: 0,
  marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px',
};

export const pageTitleStyle = {
  fontSize: '20px', fontWeight: 700, color: C.ink, margin: '0 0 6px', letterSpacing: '-0.01em',
};

export const errorStyle = {
  fontSize: '12px', color: C.ink, background: C.white, border: `2px solid ${C.red}`,
  padding: '10px 12px', margin: '0 0 16px',
};
