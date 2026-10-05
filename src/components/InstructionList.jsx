import { C, BORDER, primaryAt, inkOnPrimary } from "./Bauhaus.jsx";

export default function InstructionList({ value = [], onChange }) {
  function update(index, text) {
    onChange(value.map((item, i) => (i === index ? { ...item, text } : item)));
  }

  function remove(index) {
    onChange(
      value
        .filter((_, i) => i !== index)
        .map((item, i) => ({ ...item, position: i + 1 }))
    );
  }

  function add() {
    onChange([...value, { position: value.length + 1, text: "" }]);
  }

  return (
    <div className="flex flex-col" style={{ gap: '8px' }}>
      {value.map((step, i) => (
        <div key={i} className="flex items-start" style={{ gap: '8px' }}>
          <span style={{
            flexShrink: 0, width: '22px', height: '22px', borderRadius: '50%', boxSizing: 'border-box',
            background: primaryAt(i), color: inkOnPrimary(i), border: BORDER,
            fontSize: '10px', fontWeight: 700, marginTop: '7px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {step.position}
          </span>
          <textarea
            value={step.text}
            onChange={(e) => update(i, e.target.value)}
            placeholder={`Step ${step.position}`}
            aria-label={`Step ${step.position}`}
            rows={2}
            className="bh-input"
            style={{ flex: 1, minWidth: 0, width: 'auto', resize: 'none' }}
          />
          <button
            type="button"
            onClick={() => remove(i)}
            aria-label={`Remove step ${step.position}`}
            style={{ flexShrink: 0, width: '28px', height: '34px', fontSize: '18px', lineHeight: 1, color: C.ink, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.blue, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', textAlign: 'left' }}
      >
        + Add step
      </button>
    </div>
  );
}
