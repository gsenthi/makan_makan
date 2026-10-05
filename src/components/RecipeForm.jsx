import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase.js";
import TagInput from "./TagInput.jsx";
import IngredientList from "./IngredientList.jsx";
import InstructionList from "./InstructionList.jsx";
import LoadingSpinner from "./LoadingSpinner.jsx";
import { C, BORDER, backButtonStyle, pageTitleStyle } from "./Bauhaus.jsx";

// Saved to Supabase as each new recipe's card_color. The Bauhaus UI no
// longer displays it, but the stored value is unchanged.
const CARD_COLORS = [
  '#2a4a3a', '#344a30', '#2e4840', '#223a2c', '#2e4a36',
  '#3a5640', '#364238', '#2a4840', '#3a4830', '#2c4e3c',
];

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

function Field({ label, children }) {
  return (
    <div>
      <label className="bh-label">{label}</label>
      {children}
    </div>
  );
}

export default function RecipeForm({ title, initialData = {}, sourceType = "manual", id = null, onDeleted }) {
  const navigate = useNavigate();
  const [form, setForm] = useState(() => ({ ...EMPTY, ...initialData }));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
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
    };

    let dbError;
    if (id) {
      ({ error: dbError } = await supabase.from("recipes").update(payload).eq("id", id));
    } else {
      ({ error: dbError } = await supabase.from("recipes").insert({
        ...payload,
        source_type: sourceType,
        card_color: CARD_COLORS[Math.floor(Math.random() * CARD_COLORS.length)],
      }));
    }
    setSaving(false);

    if (dbError) {
      setError(dbError.message);
      return;
    }
    navigate(id ? `/recipe/${id}` : "/");
  }

  async function remove() {
    const name = initialData.name || "this recipe";
    if (!window.confirm(`Delete "${name}"? This can't be undone.`)) return;
    setDeleting(true);
    setError(null);
    // .select() returns the deleted rows, so a delete that Supabase's row-level
    // security silently blocks shows up as an empty result instead of success.
    const { data, error: dbError } = await supabase.from("recipes").delete().eq("id", id).select("id");
    setDeleting(false);
    if (dbError || !data?.length) {
      setError(dbError?.message || "Couldn't delete this recipe. Check that the recipes table allows deletes in Supabase.");
      return;
    }
    onDeleted?.(id);
    navigate("/", { replace: true });
  }

  return (
    <div style={{ minHeight: '100vh', background: C.paper }}>
      <div style={{ padding: '24px 16px 110px' }}>
        <button onClick={() => navigate(-1)} style={backButtonStyle}>
          ← Back
        </button>
        <h1 style={{ ...pageTitleStyle, paddingBottom: '10px', borderBottom: `4px solid ${C.red}`, marginBottom: '24px' }}>{title}</h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Field label="Recipe name *">
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Nasi Lemak"
              className="bh-input"
            />
          </Field>

          <Field label="Description">
            <textarea
              value={form.description || ""}
              onChange={(e) => set("description", e.target.value)}
              rows={4}
              className="bh-input" style={{ resize: 'none' }}
            />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <Field label="Prep time (min)">
              <input
                type="number"
                min="0"
                value={form.prep_time || ""}
                onChange={(e) => set("prep_time", e.target.value)}
                className="bh-input"
              />
            </Field>
            <Field label="Cook time (min)">
              <input
                type="number"
                min="0"
                value={form.cook_time || ""}
                onChange={(e) => set("cook_time", e.target.value)}
                className="bh-input"
              />
            </Field>
          </div>

          <Field label="Yield">
            <input
              value={form.recipe_yield || ""}
              onChange={(e) => set("recipe_yield", e.target.value)}
              placeholder="e.g. 4 servings"
              className="bh-input"
            />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <Field label="Category">
              <input
                value={form.recipe_category || ""}
                onChange={(e) => set("recipe_category", e.target.value)}
                placeholder="e.g. main"
                className="bh-input"
              />
            </Field>
            <Field label="Cuisine">
              <input
                value={form.recipe_cuisine || ""}
                onChange={(e) => set("recipe_cuisine", e.target.value)}
                placeholder="e.g. Malaysian"
                className="bh-input"
              />
            </Field>
          </div>

          <Field label="Cooking method">
            <input
              value={form.cooking_method || ""}
              onChange={(e) => set("cooking_method", e.target.value)}
              placeholder="e.g. Baking"
              className="bh-input"
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
              className="bh-input"
            />
          </Field>

          {error && (
            <p style={{ fontSize: '12px', color: C.ink, background: C.white, border: `2px solid ${C.red}`, padding: '10px 12px', margin: 0 }}>{error}</p>
          )}

          {id && (
            <div style={{ borderTop: BORDER, paddingTop: '16px', marginTop: '8px' }}>
              <button
                type="button"
                onClick={remove}
                disabled={deleting || saving}
                className="bh-btn"
                style={{ width: '100%', background: C.white, color: C.red }}
              >
                {deleting ? <><LoadingSpinner small /> Deleting…</> : "Delete recipe"}
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        padding: '10px 14px calc(10px + env(safe-area-inset-bottom))',
        background: C.yellow, borderTop: BORDER,
      }}>
        <button
          onClick={save}
          disabled={saving || deleting}
          className="bh-btn bh-btn-primary"
          style={{ width: '100%' }}
        >
          {saving ? <><LoadingSpinner small light /> Saving…</> : id ? "Save changes" : "Save recipe"}
        </button>
      </div>
    </div>
  );
}
