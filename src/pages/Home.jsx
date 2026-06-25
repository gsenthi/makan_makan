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
      .select(
        "id, name, total_time, recipe_yield, recipe_category, recipe_cuisine, keywords"
      )
      .order("created_at", { ascending: false });

    if (!error) setRecipes(data || []);
    setLoading(false);
  }

  const categories = [
    ...new Set(recipes.map((r) => r.recipe_category).filter(Boolean)),
  ];
  const cuisines = [
    ...new Set(recipes.map((r) => r.recipe_cuisine).filter(Boolean)),
  ];
  const filters = ["All", ...categories, ...cuisines];

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
    <div className="min-h-screen bg-white">
      <div className="px-4 pt-12 pb-4">
        <div className="flex items-baseline justify-between mb-4">
          <h1 className="text-2xl font-djayanti tracking-tight">Makan Makan</h1>
          <span className="text-sm text-gray-400">
            {recipes.length} recipe{recipes.length !== 1 ? "s" : ""}
          </span>
        </div>

        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search recipes…"
          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:border-gray-300 transition-colors"
        />
      </div>

      {filters.length > 1 && (
        <div className="flex gap-2 px-4 pb-4 overflow-x-auto no-scrollbar">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm border transition-colors capitalize ${
                activeFilter === f
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-500 border-gray-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      )}

      <div className="px-4 pb-24">
        {loading ? (
          <div className="flex justify-center pt-20">
            <LoadingSpinner />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center pt-20 text-gray-400">
            {recipes.length === 0 ? (
              <>
                <p className="text-lg mb-1">No recipes yet</p>
                <p className="text-sm">Tap + to add your first recipe</p>
              </>
            ) : (
              <p className="text-sm">No recipes match your search</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onClick={() => navigate(`/recipe/${recipe.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => navigate("/add")}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gray-900 text-white rounded-full flex items-center justify-center shadow-lg text-3xl leading-none"
      >
        +
      </button>
    </div>
  );
}
