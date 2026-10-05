import { C, BORDER, primaryAt } from "./Bauhaus.jsx";

export default function RecipeCard({ recipe, index, onClick }) {
  const isEven = index % 2 === 1; // 2nd, 4th… card sits in the right column

  return (
    <div
      onClick={onClick}
      style={{
        height: '100%', boxSizing: 'border-box',
        padding: '14px 12px 12px',
        background: isEven ? C.white : C.paper,
        borderRight: isEven ? 'none' : BORDER,
        borderBottom: BORDER,
        cursor: 'pointer',
      }}
    >
      <div aria-hidden style={{ width: '8px', height: '8px', borderRadius: '50%', background: primaryAt(index), marginBottom: '8px' }} />

      {recipe.recipe_cuisine && (
        <p style={{ fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: C.grey, margin: '0 0 4px' }}>
          {recipe.recipe_cuisine}
        </p>
      )}

      <h3 className="line-clamp-2" style={{ fontSize: '12px', fontWeight: 600, color: C.ink, lineHeight: 1.25, margin: '0 0 4px' }}>
        {recipe.name}
      </h3>

      {(recipe.total_time > 0 || recipe.recipe_yield) && (
        <p style={{ fontSize: '10px', color: C.grey, margin: 0 }}>
          {[
            recipe.total_time > 0 && `${recipe.total_time} min`,
            recipe.recipe_yield,
          ].filter(Boolean).join(' · ')}
        </p>
      )}

      {recipe.keywords?.length > 0 && (
        <div className="flex flex-wrap" style={{ gap: '4px', marginTop: '6px' }}>
          {recipe.keywords.slice(0, 2).map((k) => (
            <span key={k} style={{
              fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.04em',
              border: `1px solid ${C.ink}`, padding: '1px 6px',
              color: C.ink, background: 'transparent',
            }}>
              {k}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
