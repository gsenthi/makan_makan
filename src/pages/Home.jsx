import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase.js";
import RecipeCard from "../components/RecipeCard.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { BasketIcon, CheckIcon } from "../components/Icons.jsx";
import { C, BORDER, BauhausHeader, TricolourStripe, Eyebrow } from "../components/Bauhaus.jsx";

export default function Home({ basket, setBasket }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectMode, setSelectMode] = useState(false);
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

  function toggleInBasket(id) {
    setBasket((b) => (b.includes(id) ? b.filter((x) => x !== id) : [...b, id]));
  }
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
    <div style={{ minHeight: '100vh', background: C.paper }}>

      {/* ── Header ─────────────────────────────────────── */}
      <BauhausHeader>
        <div className="flex items-start justify-between">
          <Eyebrow>our recipes</Eyebrow>
          <div className="flex items-center" style={{ marginTop: '-8px', marginRight: '-4px' }}>
            <button
              onClick={() => setSelectMode((m) => !m)}
              aria-pressed={selectMode}
              style={{
                fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                padding: '5px 10px', marginRight: '8px', borderRadius: 0, border: BORDER, cursor: 'pointer',
                background: selectMode ? C.ink : C.paper, color: selectMode ? C.yellow : C.ink,
              }}
            >
              {selectMode ? "Done" : "Select"}
            </button>
            <button
              onClick={() => navigate("/basket")}
              aria-label={`Basket, ${basket.length} ${basket.length === 1 ? 'recipe' : 'recipes'}`}
              className="relative flex items-center justify-center"
              style={{
                width: '36px', height: '36px', fontSize: '22px', background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                color: C.ink, opacity: basket.length > 0 ? 1 : 0.55,
              }}
            >
              <BasketIcon />
              {basket.length > 0 && (
                <span
                  className="absolute flex items-center justify-center"
                  style={{
                    top: '1px', right: '-2px', minWidth: '16px', height: '16px', padding: '0 3px', boxSizing: 'border-box',
                    background: C.red, color: C.white, border: `1.5px solid ${C.ink}`,
                    fontSize: '9px', fontWeight: 700, lineHeight: 1,
                  }}
                >
                  {basket.length}
                </span>
              )}
            </button>
          </div>
        </div>
        <h1 style={{ fontFamily: 'Djayanti, serif', fontSize: '44px', color: C.white, lineHeight: 0.9, margin: 0, fontWeight: 'normal', textShadow: '3px 3px 0 rgba(0,0,0,0.18)' }}>
          makan<br />makan
        </h1>
        <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.6)', marginTop: '10px', marginBottom: 0, letterSpacing: '0.06em' }}>
          {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'}
          {cuisineCount > 0 && ` · ${cuisineCount} ${cuisineCount === 1 ? 'cuisine' : 'cuisines'}`}
        </p>
      </BauhausHeader>

      <TricolourStripe />

      {/* ── Selection bar ───────────────────────────────── */}
      {selectMode && (
        <div className="flex items-center justify-between" style={{ background: C.ink, padding: '6px 16px', borderBottom: BORDER }}>
          <span style={{ fontSize: '9px', letterSpacing: '0.06em', color: C.paper }}>Tap recipes to add to your basket</span>
          <span style={{ fontSize: '9px', letterSpacing: '0.06em', color: C.yellow, fontWeight: 700 }}>{basket.length} in basket</span>
        </div>
      )}

      {/* ── Search + filters ────────────────────────────── */}
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search recipes…"
        aria-label="Search recipes"
        className="bh-input"
        style={{ margin: '12px 16px 0', width: 'calc(100% - 32px)', padding: '8px 12px' }}
      />

      {filters.length > 1 && (
        <div className="no-scrollbar flex" style={{ overflowX: 'auto', padding: '8px 16px', gap: 0 }}>
          {filters.map((f, i) => {
            const active = activeFilter === f;
            return (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                aria-pressed={active}
                style={{
                  flexShrink: 0, padding: '4px 12px', fontSize: '10px', letterSpacing: '0.04em',
                  textTransform: 'capitalize', cursor: 'pointer', borderRadius: 0,
                  border: BORDER, borderRight: i === filters.length - 1 ? BORDER : 'none',
                  background: active ? C.red : C.paper,
                  color: active ? C.white : C.ink,
                }}
              >
                {f}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Recipe grid ─────────────────────────────────── */}
      <div style={{ paddingBottom: '72px', marginTop: filters.length > 1 ? 0 : '12px' }}>
        {loading ? (
          <div className="flex justify-center" style={{ paddingTop: '80px' }}>
            <LoadingSpinner />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center" style={{ paddingTop: '80px', color: C.grey }}>
            {recipes.length === 0 ? (
              <>
                <p style={{ fontSize: '13px', fontWeight: 600, color: C.ink, marginBottom: '4px' }}>No recipes yet</p>
                <p style={{ fontSize: '11px' }}>Tap + to add your first recipe</p>
              </>
            ) : (
              <p style={{ fontSize: '11px' }}>No recipes match your search</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2" style={{ gap: 0, borderTop: BORDER }}>
            {filtered.map((recipe, i) => {
              const inBasket = basket.includes(recipe.id);
              return (
                <div
                  key={recipe.id}
                  className="relative"
                  style={{ outline: inBasket ? `3px solid ${C.blue}` : 'none', outlineOffset: '-3px' }}
                >
                  <RecipeCard
                    recipe={recipe}
                    index={i}
                    onClick={() => (selectMode ? toggleInBasket(recipe.id) : navigate(`/recipe/${recipe.id}`))}
                  />
                  {inBasket && (
                    <span
                      aria-label="In basket"
                      className="absolute flex items-center justify-center pointer-events-none"
                      style={{ top: '8px', right: '8px', width: '16px', height: '16px', background: C.blue, color: C.white, fontSize: '11px' }}
                    >
                      <CheckIcon strokeWidth={3} />
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Bottom bar ──────────────────────────────────── */}
      <div
        className="fixed bottom-0 left-0 right-0 flex items-center justify-between"
        style={{ borderTop: BORDER, background: C.yellow, padding: '10px 14px calc(10px + env(safe-area-inset-bottom))' }}
      >
        <button
          onClick={() => navigate("/add")}
          style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.ink, background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0' }}
        >
          Add recipe
        </button>
        <button
          onClick={() => navigate("/add")}
          aria-label="Add recipe"
          className="flex items-center justify-center"
          style={{ width: '34px', height: '34px', background: C.ink, border: 'none', borderRadius: 0, color: C.yellow, fontSize: '20px', lineHeight: 1, cursor: 'pointer', padding: 0 }}
        >
          +
        </button>
      </div>
    </div>
  );
}
