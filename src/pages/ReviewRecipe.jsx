import { useLocation } from "react-router-dom";
import RecipeForm from "../components/RecipeForm.jsx";

export default function ReviewRecipe() {
  const { state } = useLocation();
  return (
    <RecipeForm
      title="Review recipe"
      initialData={state?.recipe || {}}
      sourceType={state?.sourceType || "photo"}
    />
  );
}
