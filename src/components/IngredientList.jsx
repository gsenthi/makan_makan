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
    <div className="space-y-2">
      {value.map((ing, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input
            value={ing.amount}
            onChange={(e) => update(i, "amount", e.target.value)}
            placeholder="Qty"
            className="w-14 px-2 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-gray-400 text-center"
          />
          <input
            value={ing.unit}
            onChange={(e) => update(i, "unit", e.target.value)}
            placeholder="Unit"
            className="w-18 px-2 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-gray-400"
          />
          <input
            value={ing.name}
            onChange={(e) => update(i, "name", e.target.value)}
            placeholder="Ingredient"
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-gray-400"
          />
          <button
            type="button"
            onClick={() => remove(i)}
            className="text-gray-300 hover:text-gray-500 text-xl leading-none flex-shrink-0 w-6 text-center"
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="text-sm text-gray-400 hover:text-gray-600 pt-1"
      >
        + Add ingredient
      </button>
    </div>
  );
}
