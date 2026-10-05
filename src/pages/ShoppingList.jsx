import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeftIcon, ShareIcon, CheckIcon } from "../components/Icons.jsx";
import { C, BORDER, BauhausHeader, TricolourStripe, Eyebrow } from "../components/Bauhaus.jsx";

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

// Paper squares so the icons read on both the red header and the yellow circle.
const iconBtn = {
  width: '32px', height: '32px', fontSize: '17px', color: C.ink,
  background: C.paper, border: BORDER, borderRadius: 0, cursor: 'pointer', padding: 0,
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
      <div className="flex flex-col items-center justify-center text-center" style={{ minHeight: '100vh', background: C.paper, padding: '0 24px' }}>
        <p style={{ fontSize: '12px', color: C.grey, marginBottom: '8px' }}>No shopping list yet</p>
        <button
          onClick={() => navigate("/basket")}
          className="bh-link"
          style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          Go to your basket
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: C.paper }}>

      {/* ── Header ─────────────────────────────────────── */}
      <BauhausHeader>
        {/* Extra height keeps the header's triangle clear of the buttons. */}
        <div className="flex items-start justify-between gap-3" style={{ minHeight: '84px' }}>
          <div>
            <Eyebrow>shopping list</Eyebrow>
            <p style={{ fontSize: '10px', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.75)', margin: 0 }}>
              {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'}
              {groups && ` · ${allItems.length} ${allItems.length === 1 ? 'item' : 'items'}`}
            </p>
          </div>
          <div className="flex items-center" style={{ gap: '6px' }}>
            <button
              onClick={share}
              disabled={!groups}
              aria-label="Share shopping list"
              className="flex items-center justify-center"
              style={{ ...iconBtn, opacity: groups ? 1 : 0.5 }}
            >
              <ShareIcon strokeWidth={2.25} />
            </button>
            <button
              onClick={() => navigate("/basket")}
              aria-label="Back to basket"
              className="flex items-center justify-center"
              style={iconBtn}
            >
              <ArrowLeftIcon strokeWidth={2.25} />
            </button>
          </div>
        </div>
      </BauhausHeader>

      <TricolourStripe />

      {/* ── This week you've decided to cook… ───────────── */}
      <div style={{ borderBottom: BORDER }}>
        <p style={{ fontSize: '13px', color: C.ink, fontStyle: 'italic', padding: '14px 16px 4px', margin: 0 }}>
          This week you've decided to cook…
        </p>
        <div className="no-scrollbar flex" style={{ gap: '6px', padding: '6px 16px 14px', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {recipeNames.map((name, i) => (
            <span
              key={i}
              className="shrink-0"
              style={{ background: C.blue, color: C.white, border: BORDER, borderRadius: 0, padding: '4px 10px', fontSize: '11px', whiteSpace: 'nowrap' }}
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
            <p style={{ fontSize: '12px', color: C.ink, background: C.white, border: `2px solid ${C.red}`, padding: '10px 12px', margin: '0 0 12px', textAlign: 'left' }}>{error}</p>
            <button
              onClick={() => setAttempt((a) => a + 1)}
              className="bh-btn bh-btn-secondary"
            >
              Try again
            </button>
          </div>
        ) : !groups ? (
          <p className="text-center" style={{ fontSize: '12px', color: C.grey, paddingTop: '60px', margin: 0 }}>
            Merging your ingredients…
          </p>
        ) : allItems.length === 0 ? (
          <p className="text-center" style={{ fontSize: '12px', color: C.grey, paddingTop: '60px', margin: 0 }}>
            Nothing left on the list
          </p>
        ) : (
          groups.map((group) => (
            <section key={group.category}>
              <h2 style={{
                fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: C.grey,
                padding: '14px 16px 6px', borderBottom: BORDER, margin: 0, fontWeight: 700,
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
                    style={{ padding: '9px 16px', borderBottom: `1px solid ${C.rule}`, background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer' }}
                  >
                    <span
                      aria-hidden
                      className="flex shrink-0 items-center justify-center"
                      style={{
                        width: '16px', height: '16px', borderRadius: 0, boxSizing: 'border-box',
                        border: BORDER,
                        background: done ? C.red : C.white,
                        color: C.white, fontSize: '11px',
                      }}
                    >
                      {done && <CheckIcon strokeWidth={3} />}
                    </span>
                    <span style={{ fontSize: '12px', color: done ? C.grey : C.ink, textDecoration: done ? 'line-through' : 'none' }}>
                      {item.amount && (
                        <span style={{ fontWeight: 600, color: done ? C.grey : C.ink }}>{item.amount} </span>
                      )}
                      <span style={{ color: done ? C.grey : C.muted }}>{item.name}</span>
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
          style={{ bottom: '64px', background: C.ink, color: C.yellow, fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '8px 12px', whiteSpace: 'nowrap' }}
        >
          List copied to clipboard
        </div>
      )}

      {/* ── Bottom bar ──────────────────────────────────── */}
      {groups && (
        <div
          className="fixed bottom-0 left-0 right-0 flex items-center justify-between"
          style={{ background: C.yellow, borderTop: BORDER, padding: '10px 14px calc(10px + env(safe-area-inset-bottom))' }}
        >
          <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.ink }}>{doneCount} of {allItems.length} done</span>
          <button
            onClick={clearDone}
            disabled={doneCount === 0}
            className="bh-btn"
            style={{ background: C.paper, color: C.ink, padding: '6px 12px', fontSize: '10px' }}
          >
            Clear done
          </button>
        </div>
      )}
    </div>
  );
}
