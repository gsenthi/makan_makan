import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase.js";
import RecipeCard from "../components/RecipeCard.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

export default function Home() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecipes();
  }, []);

  async function fetchRecipes() {
    const { data, error } = await supabase
      .from("recipes")
      .select("id, name, total_time, recipe_yield, recipe_category, recipe_cuisine, keywords, card_color")
      .order("created_at", { ascending: false });

    if (!error) setRecipes(data || []);
    setLoading(false);
  }

  const categories = [...new Set(recipes.map((r) => r.recipe_category).filter(Boolean))];
  const cuisines = [...new Set(recipes.map((r) => r.recipe_cuisine).filter(Boolean))];
  const filters = ["All", ...categories, ...cuisines];
  const cuisineCount = new Set(recipes.map((r) => r.recipe_cuisine).filter(Boolean)).size;

  const filtered = recipes.filter((r) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      r.name?.toLowerCase().includes(q) ||
      r.recipe_cuisine?.toLowerCase().includes(q) ||
      r.recipe_category?.toLowerCase().includes(q) ||
      r.keywords?.some((k) => k.toLowerCase().includes(q));
    const matchesFilter =
      activeFilter === "All" ||
      r.recipe_category === activeFilter ||
      r.recipe_cuisine === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div style={{ minHeight: '100vh', background: '#e8e2d6' }}>

      {/* ── Header ─────────────────────────────────────── */}
      <div style={{ position: 'relative', overflow: 'hidden', background: '#2c4836', padding: '56px 20px 28px' }}>
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
          <p style={{ fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(200,230,200,0.45)', marginBottom: '8px' }}>
            our recipes
          </p>
          <h1 style={{ fontFamily: 'Djayanti, serif', fontSize: '44px', color: '#d8ead4', lineHeight: 0.9, margin: 0 }}>
            makan<br />makan
          </h1>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            marginTop: '12px', paddingTop: '10px',
            borderTop: '1px solid rgba(200,230,200,0.15)',
            fontSize: '9px', color: 'rgba(200,230,200,0.45)', letterSpacing: '0.06em',
          }}>
            <span>{recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'}</span>
            {cuisineCount > 0 && (
              <>
                <span style={{ opacity: 0.5 }}>·</span>
                <span>{cuisineCount} {cuisineCount === 1 ? 'cuisine' : 'cuisines'}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Octagonal tile strip ────────────────────────── */}
      <svg width="100%" height="52" style={{ display: 'block' }} aria-hidden="true">
        <defs>
          <pattern id="octtile" x="0" y="0" width="26" height="26" patternUnits="userSpaceOnUse">
            <rect width="26" height="26" fill="#a8986a" />
            <rect x="0.5"  y="0.5"  width="4" height="4" fill="#6a8e6a" stroke="#5a7a5a" strokeWidth="0.3" />
            <rect x="21.5" y="0.5"  width="4" height="4" fill="#6a8e6a" stroke="#5a7a5a" strokeWidth="0.3" />
            <rect x="0.5"  y="21.5" width="4" height="4" fill="#6a8e6a" stroke="#5a7a5a" strokeWidth="0.3" />
            <rect x="21.5" y="21.5" width="4" height="4" fill="#6a8e6a" stroke="#5a7a5a" strokeWidth="0.3" />
            <polygon points="2,9 2,17 9,24 17,24 24,17 24,9 17,2 9,2" fill="#e8e0cc" stroke="#b8a880" strokeWidth="0.4" />
            <polygon points="2,9 2,17 9,24 17,24 24,17 24,9 17,2 9,2" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="52" fill="url(#octtile)" />
        <rect width="100%" height="2" fill="rgba(80,55,20,0.18)" />
        <rect y="50" width="100%" height="2" fill="rgba(80,55,20,0.12)" />
        <rect width="100%" height="52" fill="rgba(80,55,20,0.05)" />
      </svg>

      {/* ── Search + filters ────────────────────────────── */}
      <div style={{ padding: '16px 16px 12px' }}>
        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <svg
            aria-hidden="true"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="#9a9080" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search recipes…"
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '10px 12px 10px 36px',
              background: '#ffffff', border: '1px solid #d4cdc0',
              borderRadius: '8px', fontSize: '14px',
              outline: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              color: '#3a3226',
            }}
          />
        </div>

        {filters.length > 1 && (
          <div className="no-scrollbar" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                style={{
                  flexShrink: 0, padding: '5px 14px', borderRadius: '20px',
                  fontSize: '12px', cursor: 'pointer', textTransform: 'capitalize',
                  border: `1px solid ${activeFilter === f ? 'transparent' : '#b8ae98'}`,
                  background: activeFilter === f ? '#2e4a38' : 'transparent',
                  color: activeFilter === f ? '#d8e8d4' : '#6a5e48',
                }}
              >
                {f}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Recipe grid ─────────────────────────────────── */}
      <div style={{ padding: '0 16px 96px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '80px' }}>
            <LoadingSpinner />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: '80px', color: '#9a9080' }}>
            {recipes.length === 0 ? (
              <>
                <p style={{ fontSize: '15px', marginBottom: '4px' }}>No recipes yet</p>
                <p style={{ fontSize: '13px' }}>Tap + to add your first recipe</p>
              </>
            ) : (
              <p style={{ fontSize: '13px' }}>No recipes match your search</p>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {filtered.map((recipe, i) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                index={i}
                onClick={() => navigate(`/recipe/${recipe.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── FAB ─────────────────────────────────────────── */}
      <button
        onClick={() => navigate("/add")}
        aria-label="Add recipe"
        style={{
          position: 'fixed', bottom: '24px', right: '24px',
          width: '48px', height: '48px',
          background: '#2e4a38', color: '#d8ead4',
          borderRadius: '50%', border: 'none', fontSize: '24px', lineHeight: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(20,40,25,0.3)', cursor: 'pointer',
        }}
      >
        +
      </button>
    </div>
  );
}
