import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import AddRecipe from "./pages/AddRecipe.jsx";
import ReviewRecipe from "./pages/ReviewRecipe.jsx";
import ManualEntry from "./pages/ManualEntry.jsx";
import RecipeView from "./pages/RecipeView.jsx";
import EditRecipe from "./pages/EditRecipe.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add" element={<AddRecipe />} />
        <Route path="/add/review" element={<ReviewRecipe />} />
        <Route path="/add/manual" element={<ManualEntry />} />
        <Route path="/recipe/:id" element={<RecipeView />} />
        <Route path="/recipe/:id/edit" element={<EditRecipe />} />
      </Routes>
    </BrowserRouter>
  );
}
