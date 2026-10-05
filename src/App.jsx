import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import AddRecipe from "./pages/AddRecipe.jsx";
import ReviewRecipe from "./pages/ReviewRecipe.jsx";
import ManualEntry from "./pages/ManualEntry.jsx";
import RecipeView from "./pages/RecipeView.jsx";
import EditRecipe from "./pages/EditRecipe.jsx";
import Basket from "./pages/Basket.jsx";
import ShoppingList from "./pages/ShoppingList.jsx";

export default function App() {
  // Recipe IDs in the shopping basket. Lives here so it survives navigation
  // for the whole session; it's only cleared from the basket screen.
  const [basket, setBasket] = useState([]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home basket={basket} setBasket={setBasket} />} />
        <Route path="/add" element={<AddRecipe />} />
        <Route path="/add/review" element={<ReviewRecipe />} />
        <Route path="/add/manual" element={<ManualEntry />} />
        <Route path="/recipe/:id" element={<RecipeView />} />
        <Route path="/recipe/:id/edit" element={<EditRecipe setBasket={setBasket} />} />
        <Route path="/basket" element={<Basket basket={basket} setBasket={setBasket} />} />
        <Route path="/shopping" element={<ShoppingList />} />
      </Routes>
    </BrowserRouter>
  );
}
