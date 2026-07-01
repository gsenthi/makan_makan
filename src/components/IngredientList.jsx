const inputBase = {
  padding: '8px 10px',
  background: '#ffffff',
  border: '1px solid #d4cdc0',
  borderRadius: '10px',
  fontSize: '14px',
  outline: 'none',
  color: '#3a3226',
  minWidth: 0,
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {value.map((ing, i) => (
        <div key={i} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <input
            value={ing.amount}
            onChange={(e) => update(i, "amount", e.target.value)}
            placeholder="Qty"
            style={{ ...inputBase, width: '52px', flexShrink: 0, textAlign: 'center' }}
          />
          <input
            value={ing.unit}
            onChange={(e) => update(i, "unit", e.target.value)}
            placeholder="Unit"
            style={{ ...inputBase, width: '90px', flexShrink: 0 }}
          />
          <input
            value={ing.name}
            onChange={(e) => update(i, "name", e.target.value)}
            placeholder="Ingredient"
            style={{ ...inputBase, flex: 1 }}
          />
          <button
            type="button"
            onClick={() => remove(i)}
            style={{ flexShrink: 0, width: '24px', fontSize: '18px', lineHeight: 1, color: '#c0b8ac', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
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
        + Add ingredient
      </button>
    </div>
  );
}
