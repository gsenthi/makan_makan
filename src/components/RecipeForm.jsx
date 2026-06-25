import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase.js";
import TagInput from "./TagInput.jsx";
import IngredientList from "./IngredientList.jsx";
import InstructionList from "./InstructionList.jsx";
import LoadingSpinner from "./LoadingSpinner.jsx";

const EMPTY = {
  name: "",
  description: "",
  prep_time: "",
  cook_time: "",
  recipe_yield: "",
  recipe_category: "",
  recipe_cuisine: "",
  cooking_method: "",
  keywords: [],
  suitable_for_diet: [],
  recipe_ingredient: [],
  recipe_instructions: [],
  source_attribution: "",
};

const inp =
  "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-gray-400 transition-colors bg-white";

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

export default function RecipeForm({
  title,
  initialData = {},
  sourceType = "manual",
}) {
  const navigate = useNavigate();
  const [form, setForm] = useState(() => ({ ...EMPTY, ...initialData }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function save() {
    if (!form.name.trim()) {
      setError("Recipe name is required");
      return;
    }
    setSaving(true);
    setError(null);

    const payload = {
      name: form.name.trim(),
      description: form.description || null,
      prep_time: form.prep_time ? parseInt(form.prep_time) : null,
      cook_time: form.cook_time ? parseInt(form.cook_time) : null,
      recipe_yield: form.recipe_yield || null,
      recipe_category: form.recipe_category || null,
      recipe_cuisine: form.recipe_cuisine || null,
      cooking_method: form.cooking_method || null,
      keywords: form.keywords || [],
      suitable_for_diet: form.suitable_for_diet || [],
      recipe_ingredient: form.recipe_ingredient || [],
      recipe_instructions: form.recipe_instructions || [],
      source_attribution: form.source_attribution || null,
      source_type: sourceType,
    };

    const { error: dbError } = await supabase.from("recipes").insert(payload);
    setSaving(false);

    if (dbError) {
      setError(dbError.message);
      return;
    }
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="px-4 pt-12 pb-32">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-500 mb-6 flex items-center gap-1"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold mb-6">{title}</h1>

        <div className="space-y-5">
          <Field label="Recipe name *">
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Nasi Lemak"
              className={inp}
            />
          </Field>

          <Field label="Description">
            <textarea
              value={form.description || ""}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              className={`${inp} resize-none`}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Prep time (min)">
              <input
                type="number"
                min="0"
                value={form.prep_time || ""}
                onChange={(e) => set("prep_time", e.target.value)}
                className={inp}
              />
            </Field>
            <Field label="Cook time (min)">
              <input
                type="number"
                min="0"
                value={form.cook_time || ""}
                onChange={(e) => set("cook_time", e.target.value)}
                className={inp}
              />
            </Field>
          </div>

          <Field label="Yield">
            <input
              value={form.recipe_yield || ""}
              onChange={(e) => set("recipe_yield", e.target.value)}
              placeholder="e.g. 4 servings"
              className={inp}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <input
                value={form.recipe_category || ""}
                onChange={(e) => set("recipe_category", e.target.value)}
                placeholder="e.g. main"
                className={inp}
              />
            </Field>
            <Field label="Cuisine">
              <input
                value={form.recipe_cuisine || ""}
                onChange={(e) => set("recipe_cuisine", e.target.value)}
                placeholder="e.g. Malaysian"
                className={inp}
              />
            </Field>
          </div>

          <Field label="Cooking method">
            <input
              value={form.cooking_method || ""}
              onChange={(e) => set("cooking_method", e.target.value)}
              placeholder="e.g. Baking"
              className={inp}
            />
          </Field>

          <Field label="Keywords">
            <TagInput
              value={form.keywords || []}
              onChange={(v) => set("keywords", v)}
              placeholder="Add tags, press Enter or comma"
            />
          </Field>

          <Field label="Suitable for diet">
            <TagInput
              value={form.suitable_for_diet || []}
              onChange={(v) => set("suitable_for_diet", v)}
              placeholder="e.g. vegetarian, gluten-free"
            />
          </Field>

          <Field label="Ingredients">
            <IngredientList
              value={form.recipe_ingredient || []}
              onChange={(v) => set("recipe_ingredient", v)}
            />
          </Field>

          <Field label="Instructions">
            <InstructionList
              value={form.recipe_instructions || []}
              onChange={(v) => set("recipe_instructions", v)}
            />
          </Field>

          <Field label="Source attribution">
            <input
              value={form.source_attribution || ""}
              onChange={(e) => set("source_attribution", e.target.value)}
              placeholder="e.g. Ottolenghi Simple p.42"
              className={inp}
            />
          </Field>

          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 px-4 pb-8 pt-4 bg-white border-t border-gray-100">
        <button
          onClick={save}
          disabled={saving}
          className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {saving ? (
            <>
              <LoadingSpinner small /> Saving…
            </>
          ) : (
            "Save recipe"
          )}
        </button>
      </div>
    </div>
  );
}
