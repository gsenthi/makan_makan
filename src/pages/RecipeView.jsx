import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { C, BORDER, BauhausHeader, TricolourStripe, primaryAt, inkOnPrimary } from "../components/Bauhaus.jsx";

const sectionHeading = {
  fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
  color: C.ink, borderBottom: BORDER, padding: '0 0 6px', margin: '0 0 4px',
};

export default function RecipeView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("recipes")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        setRecipe(data);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.paper }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.paper, color: C.grey, fontSize: '12px' }}>
        Recipe not found
      </div>
    );
  }

  const allTags = [...(recipe.suitable_for_diet || []), ...(recipe.keywords || [])];

  return (
    <div style={{ minHeight: '100vh', background: C.paper }}>

      {/* ── Header ─────────────────────────────────────── */}
      <BauhausHeader>
        <div className="flex items-center justify-between" style={{ marginBottom: '18px' }}>
          <button
            onClick={() => navigate("/")}
            style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.white, background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0' }}
          >
            ← Back
          </button>
          <button
            onClick={() => navigate(`/recipe/${id}/edit`)}
            style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.ink, background: C.paper, border: BORDER, borderRadius: 0, cursor: 'pointer', padding: '5px 12px' }}
          >
            Edit
          </button>
        </div>
        {recipe.recipe_cuisine && (
          <p style={{ fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.65)', margin: '0 0 6px' }}>
            {recipe.recipe_cuisine}
          </p>
        )}
        <h1 style={{ fontFamily: 'Djayanti, serif', fontSize: '36px', fontWeight: 'normal', color: C.white, lineHeight: 1, margin: 0, paddingRight: '56px', textShadow: '3px 3px 0 rgba(0,0,0,0.18)' }}>
          {recipe.name}
        </h1>
        {(recipe.total_time > 0 || recipe.recipe_yield || recipe.recipe_category || recipe.cooking_method) && (
          <p style={{ fontSize: '10px', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.75)', marginTop: '10px', marginBottom: 0 }}>
            {[
              recipe.total_time > 0 && `${recipe.total_time} min`,
              recipe.recipe_yield,
              recipe.recipe_category,
              recipe.cooking_method,
            ].filter(Boolean).join(' · ')}
          </p>
        )}
      </BauhausHeader>

      <TricolourStripe />

      {/* ── Body ────────────────────────────────────────── */}
      <div style={{ padding: '18px 16px 64px' }}>
        {allTags.length > 0 && (
          <div className="flex flex-wrap" style={{ gap: '4px', marginBottom: '16px' }}>
            {allTags.map((t) => (
              <span key={t} style={{
                fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.04em',
                border: `1px solid ${C.ink}`, padding: '1px 6px', color: C.ink, background: 'transparent',
              }}>
                {t}
              </span>
            ))}
          </div>
        )}

        {recipe.description && (
          <p style={{ fontSize: '13px', color: C.ink, lineHeight: 1.6, margin: '0 0 24px' }}>
            {recipe.description}
          </p>
        )}

        {recipe.recipe_ingredient?.length > 0 && (
          <section style={{ marginBottom: '28px' }}>
            <h2 style={sectionHeading}>Ingredients</h2>
            {recipe.recipe_ingredient.map((ing, i) => (
              <div key={i} className="flex" style={{ gap: '12px', fontSize: '12px', padding: '8px 0', borderBottom: `1px solid ${C.rule}` }}>
                <span style={{ fontWeight: 600, color: C.ink, width: '72px', flexShrink: 0 }}>
                  {[ing.amount, ing.unit].filter(Boolean).join(' ')}
                </span>
                <span style={{ color: C.muted }}>{ing.name}</span>
              </div>
            ))}
          </section>
        )}

        {recipe.recipe_instructions?.length > 0 && (
          <section style={{ marginBottom: '28px' }}>
            <h2 style={sectionHeading}>Instructions</h2>
            {recipe.recipe_instructions.map((step, i) => (
              <div key={i} className="flex" style={{ gap: '12px', padding: '10px 0', borderBottom: `1px solid ${C.rule}` }}>
                <span style={{
                  flexShrink: 0, width: '22px', height: '22px', borderRadius: '50%', boxSizing: 'border-box',
                  background: primaryAt(i), color: inkOnPrimary(i), border: BORDER,
                  fontSize: '10px', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {step.position}
                </span>
                <p style={{ fontSize: '12px', lineHeight: 1.5, color: C.ink, flex: 1, margin: '2px 0 0' }}>
                  {step.text}
                </p>
              </div>
            ))}
          </section>
        )}

        {recipe.source_attribution && (
          <p style={{ fontSize: '10px', color: C.grey, borderTop: BORDER, paddingTop: '12px', margin: 0 }}>
            Source: {recipe.source_attribution}
          </p>
        )}
      </div>
    </div>
  );
}
