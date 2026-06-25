import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

function compressImage(file, maxDimension = 1600) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.src = url;
  });
}

export default function AddRecipe() {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [imageData, setImageData] = useState(null);
  const [sourceType, setSourceType] = useState("photo");
  const [error, setError] = useState(null);
  const cameraRef = useRef();
  const uploadRef = useRef();
  const navigate = useNavigate();

  async function handleFile(file, type) {
    if (!file) return;
    setError(null);
    setSourceType(type);
    const dataUrl = await compressImage(file);
    setPreview(dataUrl);
    setImageData(dataUrl.split(",")[1]);
  }

  async function extractRecipe() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData, mimeType: "image/jpeg" }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      navigate("/add/review", {
        state: { recipe: data, sourceType },
      });
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (preview) {
    return (
      <div className="min-h-screen bg-white">
        <div className="px-4 pt-12 pb-8">
          <button
            onClick={() => { setPreview(null); setImageData(null); }}
            className="text-sm text-gray-500 mb-6 flex items-center gap-1"
          >
            ← Back
          </button>
          <img
            src={preview}
            alt="Recipe"
            className="w-full rounded-2xl object-cover max-h-80 mb-6"
          />
          {error && (
            <p className="text-red-500 text-sm mb-4 p-3 bg-red-50 rounded-xl">
              {error}
            </p>
          )}
          <button
            onClick={extractRecipe}
            disabled={loading}
            className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <LoadingSpinner small /> Reading recipe…
              </>
            ) : (
              "Extract recipe →"
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="px-4 pt-12 pb-8">
        <button
          onClick={() => navigate("/")}
          className="text-sm text-gray-500 mb-6 flex items-center gap-1"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold mb-2">Add recipe</h1>
        <p className="text-gray-400 text-sm mb-8">
          Choose how you'd like to add a recipe
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => cameraRef.current.click()}
            className="w-full p-5 border border-gray-100 rounded-2xl text-left hover:bg-gray-50 active:bg-gray-50 transition-colors"
          >
            <div className="text-2xl mb-2">📷</div>
            <div className="font-semibold">Take a photo</div>
            <div className="text-sm text-gray-400 mt-1">
              Photograph a recipe from a book or card
            </div>
          </button>

          <button
            onClick={() => uploadRef.current.click()}
            className="w-full p-5 border border-gray-100 rounded-2xl text-left hover:bg-gray-50 active:bg-gray-50 transition-colors"
          >
            <div className="text-2xl mb-2">🖼️</div>
            <div className="font-semibold">Upload screenshot</div>
            <div className="text-sm text-gray-400 mt-1">
              Upload a screenshot from a website or app
            </div>
          </button>

          <button
            onClick={() => navigate("/add/manual")}
            className="w-full p-5 border border-gray-100 rounded-2xl text-left hover:bg-gray-50 active:bg-gray-50 transition-colors"
          >
            <div className="text-2xl mb-2">✏️</div>
            <div className="font-semibold">Enter manually</div>
            <div className="text-sm text-gray-400 mt-1">
              Type in a recipe from scratch
            </div>
          </button>
        </div>

        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0], "photo")}
        />
        <input
          ref={uploadRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0], "screenshot")}
        />
      </div>
    </div>
  );
}
