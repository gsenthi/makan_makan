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
    <div className="space-y-3">
      {value.map((step, i) => (
        <div key={i} className="flex gap-3 items-start">
          <span className="flex-shrink-0 w-6 h-6 bg-gray-900 text-white text-xs rounded-full flex items-center justify-center mt-2.5 font-medium">
            {step.position}
          </span>
          <textarea
            value={step.text}
            onChange={(e) => update(i, e.target.value)}
            placeholder={`Step ${step.position}`}
            rows={2}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-gray-400 resize-none"
          />
          <button
            type="button"
            onClick={() => remove(i)}
            className="text-gray-300 hover:text-gray-500 text-xl leading-none mt-2.5 flex-shrink-0"
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
        + Add step
      </button>
    </div>
  );
}
