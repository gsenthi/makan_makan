import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { ArrowLeftIcon, XIcon } from "../components/Icons.jsx";
import { C, BORDER, BauhausHeader, TricolourStripe, Eyebrow, primaryAt } from "../components/Bauhaus.jsx";

// "A", "A and B", "A, B and C"
function joinNames(names) {
  if (names.length <= 1) return names[0] || "";
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

export default function Basket({ basket, setBasket }) {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(basket.length > 0);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (basket.length === 0) return;
    supabase
      .from("recipes")
      .select("id, name, recipe_cuisine, total_time, recipe_ingredient")
      .in("id", basket)
      .then(({ data, error }) => {
        if (error) {
          setError("Couldn't load your basket. Check your connection and try again.");
        } else {
          setRecipes(data);
          // Drop recipes that have since been deleted so the count stays honest.
          setBasket((b) => b.filter((id) => data.some((r) => r.id === id)));
        }
        setLoading(false);
      });
    // Only fetch on load; removals below update local state directly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep basket order, and only show recipes still in the basket.
  const items = basket.map((id) => recipes.find((r) => r.id === id)).filter(Boolean);

  function remove(id) {
    setBasket((b) => b.filter((x) => x !== id));
  }

  function generate() {
    navigate("/shopping", {
      state: { recipes: items.map((r) => ({ name: r.name, recipe_ingredient: r.recipe_ingredient || [] })) },
    });
  }

  const empty = !loading && !error && items.length === 0;

  return (
    <div style={{ minHeight: '100vh', background: C.paper }}>

      {/* ── Header ─────────────────────────────────────── */}
      <BauhausHeader>
        <button
          onClick={() => navigate("/")}
          aria-label="Back to recipes"
          className="flex items-center justify-center"
          style={{ width: '32px', height: '32px', marginLeft: '-6px', marginBottom: '10px', fontSize: '20px', color: C.white, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <ArrowLeftIcon strokeWidth={2.5} />
        </button>
        <Eyebrow>your basket</Eyebrow>
        <h1 style={{ fontFamily: 'Djayanti, serif', fontSize: '32px', fontWeight: 'normal', color: C.white, lineHeight: 1, margin: 0, textShadow: '3px 3px 0 rgba(0,0,0,0.18)' }}>
          This week
        </h1>
      </BauhausHeader>

      <TricolourStripe />

      {/* ── Recipes ─────────────────────────────────────── */}
      <div style={{ paddingBottom: '80px' }}>
        {loading ? (
          <div className="flex justify-center" style={{ paddingTop: '80px' }}>
            <LoadingSpinner />
          </div>
        ) : error ? (
          <p style={{ fontSize: '12px', color: C.ink, background: C.white, border: `2px solid ${C.red}`, padding: '10px 12px', margin: '24px 16px 0' }}>{error}</p>
        ) : empty ? (
          <div className="text-center" style={{ paddingTop: '80px' }}>
            <p style={{ fontSize: '12px', color: C.grey, marginBottom: '8px' }}>No recipes in your basket yet</p>
            <button
              onClick={() => navigate("/")}
              className="bh-link"
              style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              Browse recipes
            </button>
          </div>
        ) : (
          <>
            <p style={{ fontSize: '13px', color: C.ink, fontStyle: 'italic', lineHeight: 1.5, padding: '14px 16px 12px', margin: 0, borderBottom: BORDER }}>
              This week you've decided to cook {joinNames(items.map((r) => r.name))}.
            </p>
            {items.map((r, i) => (
              <div
                key={r.id}
                className="flex items-center justify-between gap-3"
                style={{ background: C.white, borderBottom: BORDER, padding: '12px 16px' }}
              >
                <div className="flex min-w-0 items-center" style={{ gap: '10px' }}>
                  <span aria-hidden className="shrink-0" style={{ width: '8px', height: '8px', borderRadius: '50%', background: primaryAt(i) }} />
                  <div className="min-w-0">
                    <p style={{ fontSize: '12px', fontWeight: 600, color: C.ink, margin: 0 }}>{r.name}</p>
                    {(r.recipe_cuisine || r.total_time > 0) && (
                      <p style={{ fontSize: '10px', color: C.grey, margin: '2px 0 0' }}>
                        {[r.recipe_cuisine, r.total_time > 0 && `${r.total_time} min`].filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => remove(r.id)}
                  aria-label={`Remove ${r.name}`}
                  className="flex items-center justify-center shrink-0"
                  style={{ width: '32px', height: '32px', marginRight: '-8px', fontSize: '16px', color: C.ink, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  <XIcon strokeWidth={2.5} />
                </button>
              </div>
            ))}
          </>
        )}
      </div>

      {/* ── Bottom bar ──────────────────────────────────── */}
      <div
        className="fixed bottom-0 left-0 right-0 flex items-center justify-between"
        style={{ background: C.yellow, borderTop: BORDER, padding: '10px 14px calc(10px + env(safe-area-inset-bottom))' }}
      >
        <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.ink }}>
          {items.length} {items.length === 1 ? 'recipe' : 'recipes'}
        </span>
        <button
          onClick={generate}
          disabled={items.length === 0}
          className="bh-btn bh-btn-primary"
          style={{ padding: '8px 14px' }}
        >
          Generate shopping list
        </button>
      </div>
    </div>
  );
}
