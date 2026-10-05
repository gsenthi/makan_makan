import { useState } from "react";
import { C, BORDER } from "./Bauhaus.jsx";

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
    <div className="bh-taginput" style={{
      minHeight: '36px', width: '100%', boxSizing: 'border-box',
      border: BORDER, borderRadius: 0,
      padding: '5px 8px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px',
      background: C.white, cursor: 'text',
    }}>
      {value.map((tag) => (
        <span
          key={tag}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            background: 'transparent', color: C.ink,
            fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.04em',
            padding: '1px 4px 1px 6px', border: `1px solid ${C.ink}`,
          }}
        >
          {tag}
          <button
            type="button"
            onClick={() => onChange(value.filter((t) => t !== tag))}
            aria-label={`Remove ${tag}`}
            style={{ color: C.ink, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '13px', lineHeight: 1 }}
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
          fontSize: '12px', background: 'transparent',
          border: 'none', color: C.ink, padding: '2px 0',
        }}
      />
    </div>
  );
}
