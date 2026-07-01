import { useState } from "react";

export default function TagInput({ value = [], onChange, placeholder }) {
  const [input, setInput] = useState("");

  function addTag(raw) {
    const trimmed = raw.trim().toLowerCase();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput("");
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && !input && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div style={{
      minHeight: '44px', width: '100%', boxSizing: 'border-box',
      border: '1px solid #d4cdc0', borderRadius: '10px',
      padding: '6px 10px', display: 'flex', flexWrap: 'wrap', gap: '6px',
      background: '#ffffff', cursor: 'text',
    }}>
      {value.map((tag) => (
        <span
          key={tag}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            background: 'rgba(46,74,56,0.08)', color: '#3a3226',
            fontSize: '13px', padding: '2px 10px', borderRadius: '20px',
            border: '1px solid #d4cdc0',
          }}
        >
          {tag}
          <button
            type="button"
            onClick={() => onChange(value.filter((t) => t !== tag))}
            style={{ color: '#9a9080', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '15px', lineHeight: 1 }}
          >
            ×
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => input && addTag(input)}
        placeholder={value.length === 0 ? placeholder : ""}
        style={{
          flex: 1, minWidth: '100px', outline: 'none',
          fontSize: '14px', background: 'transparent',
          border: 'none', color: '#3a3226', padding: '2px 0',
        }}
      />
    </div>
  );
}
