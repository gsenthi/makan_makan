const CARD_COLORS = [
  '#2a4a3a', '#344a30', '#2e4840', '#223a2c', '#2e4a36',
  '#3a5640', '#364238', '#2a4840', '#3a4830', '#2c4e3c',
];

const LIGHT_POSITIONS = [
  'ellipse at 20% 15%',
  'ellipse at 75% 80%',
  'ellipse at 70% 20%',
  'ellipse at 25% 75%',
];

export default function RecipeCard({ recipe, index, onClick }) {
  const idSum = (recipe.id || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const bgColor = recipe.card_color || CARD_COLORS[idSum % CARD_COLORS.length];
  const lightPos = LIGHT_POSITIONS[index % 4];

  return (
    <div
      onClick={onClick}
      style={{
        background: bgColor,
        borderRadius: '6px',
        padding: '12px 12px 10px',
        cursor: 'pointer',
        boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.08)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div aria-hidden style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(${lightPos}, rgba(255,255,255,0.07) 0%, transparent 55%)`,
      }} />
      <div aria-hidden style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: '2px', background: 'rgba(160,210,160,0.2)', pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative' }}>
        {recipe.recipe_cuisine && (
          <p style={{
            fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'rgba(200,230,200,0.5)', marginBottom: '4px',
          }}>
            {recipe.recipe_cuisine}
          </p>
        )}

        <h3 className="line-clamp-2" style={{
          fontSize: '13px', fontWeight: 500, color: '#d8ead4',
          lineHeight: 1.3, marginBottom: '6px',
        }}>
          {recipe.name}
        </h3>

        {(recipe.total_time > 0 || recipe.recipe_yield) && (
          <p style={{ fontSize: '10px', color: 'rgba(200,225,200,0.55)', marginBottom: '8px' }}>
            {[
              recipe.total_time > 0 && `${recipe.total_time} min`,
              recipe.recipe_yield,
            ].filter(Boolean).join(' · ')}
          </p>
        )}

        {recipe.keywords?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {recipe.keywords.slice(0, 2).map((k) => (
              <span key={k} style={{
                fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.04em',
                border: '1px solid rgba(160,200,160,0.22)',
                color: 'rgba(200,230,200,0.65)',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '3px', padding: '1px 5px',
              }}>
                {k}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
