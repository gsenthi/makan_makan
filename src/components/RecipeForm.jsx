import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase.js";
import TagInput from "./TagInput.jsx";
import IngredientList from "./IngredientList.jsx";
import InstructionList from "./InstructionList.jsx";
import LoadingSpinner from "./LoadingSpinner.jsx";

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

const inputStyle = {
  width: '100%', boxSizing: 'border-box',
  padding: '10px 12px',
  background: '#ffffff', border: '1px solid #d4cdc0',
  borderRadius: '10px', fontSize: '14px',
  outline: 'none', color: '#3a3226',
};

function Field({ label, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: '#9a9080', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

export default function RecipeForm({ title, initialData = {}, sourceType = "manual", id = null }) {
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

  return (
    <div style={{ minHeight: '100vh', background: '#e8e2d6' }}>
      <div style={{ padding: '52px 16px 120px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{ fontSize: '13px', color: '#6a5e48', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          ← Back
        </button>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#3a3226', marginBottom: '24px' }}>{title}</h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Field label="Recipe name *">
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Nasi Lemak"
              style={inputStyle}
            />
          </Field>

          <Field label="Description">
            <textarea
              value={form.description || ""}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              style={{ ...inputStyle, resize: 'none' }}
            />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <Field label="Prep time (min)">
              <input
                type="number"
                min="0"
                value={form.prep_time || ""}
                onChange={(e) => set("prep_time", e.target.value)}
                style={inputStyle}
              />
            </Field>
            <Field label="Cook time (min)">
              <input
                type="number"
                min="0"
                value={form.cook_time || ""}
                onChange={(e) => set("cook_time", e.target.value)}
                style={inputStyle}
              />
            </Field>
          </div>

          <Field label="Yield">
            <input
              value={form.recipe_yield || ""}
              onChange={(e) => set("recipe_yield", e.target.value)}
              placeholder="e.g. 4 servings"
              style={inputStyle}
            />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <Field label="Category">
              <input
                value={form.recipe_category || ""}
                onChange={(e) => set("recipe_category", e.target.value)}
                placeholder="e.g. main"
                style={inputStyle}
              />
            </Field>
            <Field label="Cuisine">
              <input
                value={form.recipe_cuisine || ""}
                onChange={(e) => set("recipe_cuisine", e.target.value)}
                placeholder="e.g. Malaysian"
                style={inputStyle}
              />
            </Field>
          </div>

          <Field label="Cooking method">
            <input
              value={form.cooking_method || ""}
              onChange={(e) => set("cooking_method", e.target.value)}
              placeholder="e.g. Baking"
              style={inputStyle}
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
              style={inputStyle}
            />
          </Field>

          {error && (
            <p style={{ fontSize: '13px', color: '#c0392b' }}>{error}</p>
          )}
        </div>
      </div>

      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        padding: '12px 16px 32px',
        background: '#e8e2d6', borderTop: '1px solid #d4cdc0',
      }}>
        <button
          onClick={save}
          disabled={saving}
          style={{
            width: '100%', padding: '14px',
            background: '#2e4a38', color: '#d8ead4',
            border: 'none', borderRadius: '10px',
            fontSize: '15px', fontWeight: 500,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? <><LoadingSpinner small /> Saving…</> : id ? "Save changes" : "Save recipe"}
        </button>
      </div>
    </div>
  );
}
