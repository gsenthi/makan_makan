import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

const CARD_COLORS = [
  '#2a4a3a', '#344a30', '#2e4840', '#223a2c', '#2e4a36',
  '#3a5640', '#364238', '#2a4840', '#3a4830', '#2c4e3c',
];

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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e8e2d6' }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e8e2d6', color: '#9a9080' }}>
        Recipe not found
      </div>
    );
  }

  const idSum = (recipe.id || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const headerColor = recipe.card_color || CARD_COLORS[idSum % CARD_COLORS.length];
  const allTags = [...(recipe.suitable_for_diet || []), ...(recipe.keywords || [])];

  return (
    <div style={{ minHeight: '100vh', background: '#e8e2d6' }}>

      {/* ── Header ─────────────────────────────────────── */}
      <div style={{ position: 'relative', overflow: 'hidden', background: headerColor, padding: '52px 20px 24px' }}>
        <div aria-hidden style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `
            radial-gradient(ellipse at 15% 20%, rgba(100,160,100,0.18) 0%, transparent 55%),
            radial-gradient(ellipse at 85% 85%, rgba(0,0,0,0.14) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(80,130,70,0.08) 0%, transparent 70%),
            radial-gradient(ellipse at 40% 0%,  rgba(140,200,130,0.12) 0%, transparent 40%)
          `,
        }} />
        <div aria-hidden style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.06,
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 3px),
            repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(0,0,0,0.02) 3px, rgba(0,0,0,0.02) 4px)
          `,
        }} />

        <div style={{ position: 'relative' }}>
          <button
            onClick={() => navigate("/")}
            style={{ fontSize: '13px', color: 'rgba(200,230,200,0.7)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            ← Back
          </button>
          {recipe.recipe_cuisine && (
            <p style={{ fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(200,230,200,0.5)', marginBottom: '6px' }}>
              {recipe.recipe_cuisine}
            </p>
          )}
          <h1 style={{ fontFamily: 'Djayanti, serif', fontSize: '36px', color: '#d8ead4', lineHeight: 1.05, margin: 0 }}>
            {recipe.name}
          </h1>
          {(recipe.total_time > 0 || recipe.recipe_yield || recipe.recipe_category || recipe.cooking_method) && (
            <p style={{ fontSize: '12px', color: 'rgba(200,225,200,0.6)', marginTop: '10px', marginBottom: 0 }}>
              {[
                recipe.total_time > 0 && `${recipe.total_time} min`,
                recipe.recipe_yield,
                recipe.recipe_category,
                recipe.cooking_method,
              ].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────── */}
      <div style={{ padding: '20px 16px 80px' }}>
        {allTags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
            {allTags.map((t) => (
              <span key={t} style={{
                fontSize: '11px', background: 'rgba(255,255,255,0.6)',
                border: '1px solid #d4cdc0', color: '#6a5e48',
                padding: '3px 10px', borderRadius: '20px', textTransform: 'capitalize',
              }}>
                {t}
              </span>
            ))}
          </div>
        )}

        {recipe.description && (
          <p style={{ fontSize: '14px', color: '#5a5040', lineHeight: 1.6, marginBottom: '20px' }}>
            {recipe.description}
          </p>
        )}

        {recipe.recipe_ingredient?.length > 0 && (
          <div style={{ background: '#ffffff', border: '1px solid #d4cdc0', borderRadius: '10px', padding: '16px', marginBottom: '12px' }}>
            <h2 style={{ fontSize: '13px', fontWeight: 600, color: '#3a3226', marginBottom: '14px', marginTop: 0 }}>
              Ingredients
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recipe.recipe_ingredient.map((ing, i) => (
                <div key={i} style={{ display: 'flex', gap: '16px', fontSize: '13px' }}>
                  <span style={{ color: '#9a9080', width: '80px', flexShrink: 0, textAlign: 'right' }}>
                    {[ing.amount, ing.unit].filter(Boolean).join(' ')}
                  </span>
                  <span style={{ color: '#3a3226' }}>{ing.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {recipe.recipe_instructions?.length > 0 && (
          <div style={{ background: '#ffffff', border: '1px solid #d4cdc0', borderRadius: '10px', padding: '16px', marginBottom: '12px' }}>
            <h2 style={{ fontSize: '13px', fontWeight: 600, color: '#3a3226', marginBottom: '14px', marginTop: 0 }}>
              Instructions
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {recipe.recipe_instructions.map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px' }}>
                  <span style={{
                    flexShrink: 0, width: '24px', height: '24px',
                    background: '#2e4a38', color: '#d8ead4',
                    fontSize: '11px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 500, marginTop: '1px',
                  }}>
                    {step.position}
                  </span>
                  <p style={{ fontSize: '13px', lineHeight: 1.6, color: '#3a3226', flex: 1, margin: 0 }}>
                    {step.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {recipe.source_attribution && (
          <p style={{ fontSize: '11px', color: '#9a9080', borderTop: '1px solid #d4cdc0', paddingTop: '16px', marginTop: '8px' }}>
            Source: {recipe.source_attribution}
          </p>
        )}
      </div>
    </div>
  );
}
