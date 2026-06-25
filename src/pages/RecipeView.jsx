import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

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
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Recipe not found
      </div>
    );
  }

  const allTags = [
    ...(recipe.suitable_for_diet || []),
    ...(recipe.keywords || []),
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="px-4 pt-12 pb-16">
        <button
          onClick={() => navigate("/")}
          className="text-sm text-gray-500 mb-6 flex items-center gap-1"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-bold leading-tight mb-4">{recipe.name}</h1>

        {/* Meta row */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mb-4">
          {recipe.total_time > 0 && <span>{recipe.total_time} min</span>}
          {recipe.recipe_yield && <span>{recipe.recipe_yield}</span>}
          {recipe.recipe_cuisine && <span>{recipe.recipe_cuisine}</span>}
          {recipe.recipe_category && (
            <span className="capitalize">{recipe.recipe_category}</span>
          )}
          {recipe.cooking_method && <span>{recipe.cooking_method}</span>}
        </div>

        {/* Tags */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-6">
            {allTags.map((t) => (
              <span
                key={t}
                className="text-xs bg-gray-50 text-gray-500 px-3 py-1 rounded-full capitalize"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {recipe.description && (
          <p className="text-gray-600 text-sm leading-relaxed mb-8">
            {recipe.description}
          </p>
        )}

        {/* Ingredients */}
        {recipe.recipe_ingredient?.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-semibold mb-4">Ingredients</h2>
            <div className="space-y-3">
              {recipe.recipe_ingredient.map((ing, i) => (
                <div key={i} className="flex gap-4 text-sm">
                  <span className="text-gray-400 w-24 flex-shrink-0 text-right">
                    {[ing.amount, ing.unit].filter(Boolean).join(" ")}
                  </span>
                  <span className="text-gray-900">{ing.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        {recipe.recipe_instructions?.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-semibold mb-4">Instructions</h2>
            <div className="space-y-6">
              {recipe.recipe_instructions.map((step, i) => (
                <div key={i} className="flex gap-4">
                  <span className="flex-shrink-0 w-7 h-7 bg-gray-900 text-white text-xs rounded-full flex items-center justify-center font-medium mt-0.5">
                    {step.position}
                  </span>
                  <p className="text-sm leading-relaxed text-gray-800 flex-1">
                    {step.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {recipe.source_attribution && (
          <p className="text-xs text-gray-400 border-t border-gray-100 pt-4 mt-6">
            Source: {recipe.source_attribution}
          </p>
        )}
      </div>
    </div>
  );
}
