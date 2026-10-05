import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase.js";
import RecipeForm from "../components/RecipeForm.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { C } from "../components/Bauhaus.jsx";

export default function EditRecipe() {
  const { id } = useParams();
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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.paper }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.paper, color: C.grey, fontSize: '12px' }}>
        Recipe not found
      </div>
    );
  }

  return <RecipeForm title="Edit recipe" initialData={recipe} id={id} />;
}
