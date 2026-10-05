import { C } from "./Bauhaus.jsx";

const removeBtn = {
  flexShrink: 0, width: '28px', height: '34px', fontSize: '18px', lineHeight: 1,
  color: C.ink, background: 'none', border: 'none', cursor: 'pointer', padding: 0,
};

const addBtn = {
  fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
  color: C.blue, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', textAlign: 'left',
};

export default function IngredientList({ value = [], onChange }) {
  function update(index, field, val) {
    onChange(value.map((item, i) => (i === index ? { ...item, [field]: val } : item)));
  }

  function remove(index) {
    onChange(value.filter((_, i) => i !== index));
  }

  function add() {
    onChange([...value, { amount: "", unit: "", name: "" }]);
  }

  return (
    <div className="flex flex-col" style={{ gap: '6px' }}>
      {value.map((ing, i) => (
        <div key={i} className="flex items-center" style={{ gap: '4px' }}>
          <input
            value={ing.amount}
            onChange={(e) => update(i, "amount", e.target.value)}
            placeholder="Qty"
            aria-label="Quantity"
            className="bh-input"
            style={{ width: '64px', flexShrink: 0, textAlign: 'center', minWidth: 0, paddingLeft: '4px', paddingRight: '4px' }}
          />
          <input
            value={ing.unit}
            onChange={(e) => update(i, "unit", e.target.value)}
            placeholder="Unit"
            aria-label="Unit"
            className="bh-input"
            style={{ width: '68px', flexShrink: 0, minWidth: 0, paddingLeft: '8px', paddingRight: '6px' }}
          />
          <input
            value={ing.name}
            onChange={(e) => update(i, "name", e.target.value)}
            placeholder="Ingredient"
            aria-label="Ingredient"
            className="bh-input"
            style={{ flex: 1, minWidth: 0, width: 'auto' }}
          />
          <button type="button" onClick={() => remove(i)} aria-label="Remove ingredient" style={removeBtn}>
            ×
          </button>
        </div>
      ))}
      <button type="button" onClick={add} style={addBtn}>
        + Add ingredient
      </button>
    </div>
  );
}
