export default function RecipeCard({ recipe, onClick }) {
  return (
    <div
      onClick={onClick}
      className="border border-gray-100 rounded-2xl p-4 cursor-pointer active:bg-gray-50 transition-colors"
    >
      <h3 className="font-semibold text-sm leading-tight mb-2 line-clamp-2">
        {recipe.name}
      </h3>

      <div className="space-y-0.5 mb-3">
        {recipe.total_time > 0 && (
          <p className="text-xs text-gray-400">{recipe.total_time} min</p>
        )}
        {recipe.recipe_yield && (
          <p className="text-xs text-gray-400">{recipe.recipe_yield}</p>
        )}
        {recipe.recipe_cuisine && (
          <p className="text-xs text-gray-400">{recipe.recipe_cuisine}</p>
        )}
      </div>

      {recipe.keywords?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {recipe.keywords.slice(0, 3).map((k) => (
            <span
              key={k}
              className="text-xs bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full"
            >
              {k}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
