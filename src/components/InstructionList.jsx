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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {value.map((step, i) => (
        <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <span style={{
            flexShrink: 0, width: '24px', height: '24px',
            background: '#2e4a38', color: '#d8ead4',
            fontSize: '11px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 500, marginTop: '10px',
          }}>
            {step.position}
          </span>
          <textarea
            value={step.text}
            onChange={(e) => update(i, e.target.value)}
            placeholder={`Step ${step.position}`}
            rows={2}
            style={{
              flex: 1, minWidth: 0, padding: '8px 10px',
              background: '#ffffff', border: '1px solid #d4cdc0',
              borderRadius: '10px', fontSize: '14px',
              outline: 'none', color: '#3a3226',
              resize: 'none', fontFamily: 'inherit',
            }}
          />
          <button
            type="button"
            onClick={() => remove(i)}
            style={{ flexShrink: 0, fontSize: '18px', lineHeight: 1, color: '#c0b8ac', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: '10px' }}
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        style={{ fontSize: '13px', color: '#9a9080', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', textAlign: 'left' }}
      >
        + Add step
      </button>
    </div>
  );
}
