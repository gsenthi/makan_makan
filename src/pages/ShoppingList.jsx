import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeftIcon, ShareIcon, CheckIcon } from "../components/Icons.jsx";

const CATEGORIES = ["produce", "meat & fish", "dairy & eggs", "pantry", "spices & condiments", "other"];

// Normalises the API response: known categories in a fixed order, anything
// unexpected folded into "other", empty groups dropped, stable ids per item.
function prepareGroups(groups = []) {
  const byCategory = new Map(CATEGORIES.map((c) => [c, []]));
  for (const group of groups) {
    const key = String(group.category || "").trim().toLowerCase();
    const bucket = byCategory.get(key) || byCategory.get("other");
    for (const item of group.items || []) {
      if (item?.name) bucket.push({ amount: item.amount || "", name: item.name });
    }
  }
  return CATEGORIES
    .map((category) => ({
      category,
      items: byCategory.get(category).map((item, i) => ({ ...item, id: `${category}-${i}` })),
    }))
    .filter((g) => g.items.length > 0);
}

function buildShareText(recipeNames, groups, ticked) {
  const lines = ["Shopping list", `This week: ${recipeNames.join(", ")}`, "———"];
  const sections = groups
    .map((g) => ({ ...g, items: g.items.filter((item) => !ticked.has(item.id)) }))
    .filter((g) => g.items.length > 0)
    .map((g) => [g.category.toUpperCase(), ...g.items.map((item) => `☐ ${[item.amount, item.name].filter(Boolean).join(" ")}`)].join("\n"));
  return [...lines, sections.join("\n\n")].join("\n");
}

const iconBtn = {
  width: '32px', height: '32px', fontSize: '20px', color: 'rgba(200,230,200,0.7)',
  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
};

export default function ShoppingList() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const recipes = state?.recipes || [];
  const recipeNames = recipes.map((r) => r.name);

  const [groups, setGroups] = useState(null);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const [ticked, setTicked] = useState(() => new Set());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (recipes.length === 0) return;
    const controller = new AbortController();
    setError(null);
    setGroups(null);
    fetch("/api/merge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipes }),
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setGroups(prepareGroups(data.groups));
        setTicked(new Set());
      })
      .catch((err) => {
        if (err.name !== "AbortError") setError(err.message || "Something went wrong. Please try again.");
      });
    return () => controller.abort();
    // recipes comes from navigation state and doesn't change while mounted
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  const allItems = groups ? groups.flatMap((g) => g.items) : [];
  const doneCount = allItems.filter((item) => ticked.has(item.id)).length;

  function toggle(id) {
    setTicked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function clearDone() {
    if (doneCount === 0) return;
    if (!window.confirm(`Remove ${doneCount} ticked ${doneCount === 1 ? "item" : "items"} from the list?`)) return;
    setGroups((gs) =>
      gs.map((g) => ({ ...g, items: g.items.filter((item) => !ticked.has(item.id)) })).filter((g) => g.items.length > 0)
    );
    setTicked(new Set());
  }

  async function share() {
    if (!groups) return;
    const text = buildShareText(recipeNames, groups, ticked);
    if (navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch (err) {
        if (err.name === "AbortError") return; // user closed the share sheet
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.alert("Couldn't share or copy the list on this device.");
    }
  }

  if (recipes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center" style={{ minHeight: '100vh', background: '#e8e2d6', padding: '0 24px' }}>
        <p style={{ fontSize: '13px', color: '#9a9080', marginBottom: '8px' }}>No shopping list yet</p>
        <button
          onClick={() => navigate("/basket")}
          style={{ fontSize: '13px', color: '#2e4a38', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
        >
          Go to your basket
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#e8e2d6' }}>

      {/* ── Header ─────────────────────────────────────── */}
      <div style={{ position: 'relative', overflow: 'hidden', background: '#2c4836', padding: '52px 20px 20px' }}>
        <div aria-hidden style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `
            radial-gradient(ellipse at 15% 20%, rgba(100,160,100,0.18) 0%, transparent 55%),
            radial-gradient(ellipse at 85% 85%, rgba(0,0,0,0.14) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(80,130,70,0.08) 0%, transparent 70%),
            radial-gradient(ellipse at 40% 0%,  rgba(140,200,130,0.12) 0%, transparent 40%)
          `,
        }} />
        <div className="relative flex items-start justify-between gap-3">
          <div>
            <p style={{ fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(200,230,200,0.45)', margin: '0 0 6px' }}>
              shopping list
            </p>
            <p style={{ fontSize: '12px', color: 'rgba(200,225,200,0.75)', margin: 0 }}>
              {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'}
              {groups && ` · ${allItems.length} ${allItems.length === 1 ? 'item' : 'items'}`}
            </p>
          </div>
          <div className="flex items-center gap-1" style={{ marginTop: '-6px', marginRight: '-6px' }}>
            <button
              onClick={share}
              disabled={!groups}
              aria-label="Share shopping list"
              className="flex items-center justify-center"
              style={{ ...iconBtn, opacity: groups ? 1 : 0.4 }}
            >
              <ShareIcon />
            </button>
            <button
              onClick={() => navigate("/basket")}
              aria-label="Back to basket"
              className="flex items-center justify-center"
              style={iconBtn}
            >
              <ArrowLeftIcon />
            </button>
          </div>
        </div>
      </div>

      {/* ── This week you've decided to cook… ───────────── */}
      <div style={{ borderBottom: '1px solid #d0c8b8' }}>
        <p style={{ fontSize: '13px', color: '#3a3226', fontStyle: 'italic', padding: '14px 16px 4px', margin: 0 }}>
          This week you've decided to cook…
        </p>
        <div className="no-scrollbar flex" style={{ gap: '6px', padding: '6px 16px 14px', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {recipeNames.map((name, i) => (
            <span
              key={i}
              className="shrink-0"
              style={{ background: '#2e4a38', color: '#d8ead4', borderRadius: '20px', padding: '4px 10px', fontSize: '11px', whiteSpace: 'nowrap' }}
            >
              {name}
            </span>
          ))}
        </div>
      </div>

      {/* ── Ingredients ─────────────────────────────────── */}
      <div style={{ paddingBottom: '80px' }}>
        {error ? (
          <div className="text-center" style={{ padding: '60px 24px 0' }}>
            <p style={{ fontSize: '12px', color: '#c0392b', marginBottom: '10px' }}>{error}</p>
            <button
              onClick={() => setAttempt((a) => a + 1)}
              style={{ fontSize: '12px', color: '#2e4a38', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
            >
              Try again
            </button>
          </div>
        ) : !groups ? (
          <p className="text-center" style={{ fontSize: '12px', color: '#9a9080', paddingTop: '60px', margin: 0 }}>
            Merging your ingredients…
          </p>
        ) : allItems.length === 0 ? (
          <p className="text-center" style={{ fontSize: '12px', color: '#9a9080', paddingTop: '60px', margin: 0 }}>
            Nothing left on the list
          </p>
        ) : (
          groups.map((group) => (
            <section key={group.category}>
              <h2 style={{
                fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8a7a62',
                padding: '10px 16px 6px', borderBottom: '0.5px solid #d0c8b8', margin: 0, fontWeight: 600,
              }}>
                {group.category}
              </h2>
              {group.items.map((item) => {
                const done = ticked.has(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => toggle(item.id)}
                    aria-pressed={done}
                    className="flex w-full items-center gap-3 text-left"
                    style={{ padding: '8px 16px', borderBottom: '0.5px solid #ede8de', background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer' }}
                  >
                    <span
                      aria-hidden
                      className="flex shrink-0 items-center justify-center"
                      style={{
                        width: '16px', height: '16px', borderRadius: '3px', boxSizing: 'border-box',
                        border: done ? 'none' : '1px solid #b0a880',
                        background: done ? '#2e4a38' : 'transparent',
                        color: '#ffffff', fontSize: '12px',
                      }}
                    >
                      {done && <CheckIcon strokeWidth={3} />}
                    </span>
                    <span style={{ fontSize: '12px', color: done ? '#b0a890' : '#3a3226', textDecoration: done ? 'line-through' : 'none' }}>
                      {item.amount && (
                        <span style={{ fontWeight: 500, color: done ? '#b0a890' : '#3a3226' }}>{item.amount} </span>
                      )}
                      <span style={{ color: done ? '#b0a890' : '#5a4e38' }}>{item.name}</span>
                    </span>
                  </button>
                );
              })}
            </section>
          ))
        )}
      </div>

      {copied && (
        <div
          role="status"
          className="fixed left-1/2 -translate-x-1/2"
          style={{ bottom: '64px', background: '#2e4a38', color: '#d8ead4', fontSize: '11px', padding: '6px 12px', borderRadius: '20px' }}
        >
          List copied to clipboard
        </div>
      )}

      {/* ── Bottom bar ──────────────────────────────────── */}
      {groups && (
        <div
          className="fixed bottom-0 left-0 right-0 flex items-center justify-between"
          style={{ background: '#e0dace', borderTop: '1px solid #c0b898', padding: '10px 16px calc(10px + env(safe-area-inset-bottom))' }}
        >
          <span style={{ fontSize: '11px', color: '#8a7a62' }}>{doneCount} of {allItems.length} done</span>
          <button
            onClick={clearDone}
            disabled={doneCount === 0}
            style={{ fontSize: '11px', color: '#2e4a38', fontWeight: 500, background: 'none', border: 'none', cursor: doneCount === 0 ? 'default' : 'pointer', padding: '4px 0', opacity: doneCount === 0 ? 0.4 : 1 }}
          >
            Clear done
          </button>
        </div>
      )}
    </div>
  );
}
