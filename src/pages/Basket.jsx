import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { ArrowLeftIcon, XIcon } from "../components/Icons.jsx";

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
    <div style={{ minHeight: '100vh', background: '#e8e2d6' }}>

      {/* ── Header ─────────────────────────────────────── */}
      <div style={{ position: 'relative', overflow: 'hidden', background: '#2c4836', padding: '52px 20px 24px' }}>
        <div aria-hidden style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `
            radial-gradient(ellipse at 15% 20%, rgba(100,160,100,0.18) 0%, transparent 55%),
            radial-gradient(ellipse at 85% 85%, rgba(0,0,0,0.14) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(80,130,70,0.08) 0%, transparent 70%),
            radial-gradient(ellipse at 40% 0%,  rgba(140,200,130,0.12) 0%, transparent 40%)
          `,
        }} />
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => navigate("/")}
            aria-label="Back to recipes"
            className="flex items-center justify-center"
            style={{ width: '32px', height: '32px', marginLeft: '-6px', marginBottom: '12px', fontSize: '20px', color: 'rgba(200,230,200,0.7)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <ArrowLeftIcon />
          </button>
          <p style={{ fontSize: '8px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(200,230,200,0.45)', marginBottom: '6px' }}>
            your basket
          </p>
          <h1 style={{ fontFamily: 'Djayanti, serif', fontSize: '32px', color: '#d8ead4', lineHeight: 1, margin: 0 }}>
            This week
          </h1>
        </div>
      </div>

      {/* ── Recipes ─────────────────────────────────────── */}
      <div style={{ paddingBottom: '96px' }}>
        {loading ? (
          <div className="flex justify-center" style={{ paddingTop: '80px' }}>
            <LoadingSpinner />
          </div>
        ) : error ? (
          <p className="text-center" style={{ fontSize: '13px', color: '#c0392b', padding: '80px 24px 0' }}>{error}</p>
        ) : empty ? (
          <div className="text-center" style={{ paddingTop: '80px' }}>
            <p style={{ fontSize: '13px', color: '#9a9080', marginBottom: '8px' }}>No recipes in your basket yet</p>
            <button
              onClick={() => navigate("/")}
              style={{ fontSize: '13px', color: '#2e4a38', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
            >
              Browse recipes
            </button>
          </div>
        ) : (
          <>
            <p style={{ fontSize: '13px', color: '#8a7a62', fontStyle: 'italic', padding: '14px 16px 10px', margin: 0 }}>
              This week you've decided to cook {joinNames(items.map((r) => r.name))}.
            </p>
            {items.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between gap-3"
                style={{ background: '#ffffff', borderBottom: '1px solid #ede8de', padding: '12px 16px' }}
              >
                <div className="min-w-0">
                  <p style={{ fontSize: '13px', fontWeight: 500, color: '#2a1e10', margin: 0 }}>{r.name}</p>
                  {(r.recipe_cuisine || r.total_time > 0) && (
                    <p style={{ fontSize: '11px', color: '#8a7a62', margin: '2px 0 0' }}>
                      {[r.recipe_cuisine, r.total_time > 0 && `${r.total_time} min`].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => remove(r.id)}
                  aria-label={`Remove ${r.name}`}
                  className="flex items-center justify-center shrink-0"
                  style={{ width: '32px', height: '32px', marginRight: '-8px', fontSize: '16px', color: '#b0a080', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  <XIcon />
                </button>
              </div>
            ))}
          </>
        )}
      </div>

      {/* ── Bottom bar ──────────────────────────────────── */}
      <div
        className="fixed bottom-0 left-0 right-0 flex items-center justify-between"
        style={{ background: '#e0dace', borderTop: '1px solid #c0b898', padding: '12px 16px calc(12px + env(safe-area-inset-bottom))' }}
      >
        <span style={{ fontSize: '11px', color: '#8a7a62' }}>
          {items.length} {items.length === 1 ? 'recipe' : 'recipes'}
        </span>
        <button
          onClick={generate}
          disabled={items.length === 0}
          style={{
            background: '#2e4a38', color: '#d8ead4', border: 'none',
            borderRadius: '6px', padding: '8px 16px',
            fontSize: '12px', fontWeight: 500, letterSpacing: '0.03em',
            cursor: items.length === 0 ? 'not-allowed' : 'pointer',
            opacity: items.length === 0 ? 0.4 : 1,
          }}
        >
          Generate shopping list
        </button>
      </div>
    </div>
  );
}
