import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

const BACK_BTN = { fontSize: '13px', color: '#6a5e48', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '4px' };

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
  const [urlMode, setUrlMode] = useState(false);
  const [url, setUrl] = useState("");
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
      navigate("/add/review", { state: { recipe: data, sourceType } });
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function extractFromUrl() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      navigate("/add/review", { state: { recipe: data, sourceType: "url" } });
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (urlMode) {
    return (
      <div style={{ minHeight: '100vh', background: '#e8e2d6' }}>
        <div style={{ padding: '52px 16px 32px' }}>
          <button onClick={() => { setUrlMode(false); setError(null); setUrl(""); }} style={BACK_BTN}>
            ← Back
          </button>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#3a3226', marginBottom: '6px' }}>Add from URL</h1>
          <p style={{ fontSize: '14px', color: '#9a9080', marginBottom: '24px' }}>Paste a link to a recipe page</p>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && url && extractFromUrl()}
            placeholder="https://..."
            autoFocus
            style={{
              width: '100%', padding: '14px',
              background: '#ffffff', border: '1px solid #d4cdc0',
              borderRadius: '10px', fontSize: '15px', color: '#3a3226',
              boxSizing: 'border-box', marginBottom: '12px',
              outline: 'none',
            }}
          />
          {error && (
            <p style={{ fontSize: '13px', color: '#c0392b', marginBottom: '16px', padding: '12px', background: 'rgba(192,57,43,0.08)', borderRadius: '8px' }}>
              {error}
            </p>
          )}
          <button
            onClick={extractFromUrl}
            disabled={loading || !url}
            style={{
              width: '100%', padding: '14px',
              background: '#2e4a38', color: '#d8ead4',
              border: 'none', borderRadius: '10px',
              fontSize: '15px', fontWeight: 500,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              cursor: (loading || !url) ? 'not-allowed' : 'pointer',
              opacity: (loading || !url) ? 0.6 : 1,
            }}
          >
            {loading ? <><LoadingSpinner small /> Scraping recipe…</> : "Extract recipe →"}
          </button>
        </div>
      </div>
    );
  }

  if (preview) {
    return (
      <div style={{ minHeight: '100vh', background: '#e8e2d6' }}>
        <div style={{ padding: '52px 16px 32px' }}>
          <button
            onClick={() => { setPreview(null); setImageData(null); }}
            style={BACK_BTN}
          >
            ← Back
          </button>
          <img src={preview} alt="Recipe" style={{ width: '100%', borderRadius: '12px', objectFit: 'cover', maxHeight: '320px', marginBottom: '20px' }} />
          {error && (
            <p style={{ fontSize: '13px', color: '#c0392b', marginBottom: '16px', padding: '12px', background: 'rgba(192,57,43,0.08)', borderRadius: '8px' }}>
              {error}
            </p>
          )}
          <button
            onClick={extractRecipe}
            disabled={loading}
            style={{
              width: '100%', padding: '14px',
              background: '#2e4a38', color: '#d8ead4',
              border: 'none', borderRadius: '10px',
              fontSize: '15px', fontWeight: 500,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? <><LoadingSpinner small /> Reading recipe…</> : "Extract recipe →"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#e8e2d6' }}>
      <div style={{ padding: '52px 16px 32px' }}>
        <button
          onClick={() => navigate("/")}
          style={BACK_BTN}
        >
          ← Back
        </button>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#3a3226', marginBottom: '6px' }}>Add recipe</h1>
        <p style={{ fontSize: '14px', color: '#9a9080', marginBottom: '28px' }}>Choose how you'd like to add a recipe</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { icon: '📷', label: 'Take a photo', sub: 'Photograph a recipe from a book or card', onClick: () => cameraRef.current.click() },
            { icon: '🖼️', label: 'Upload screenshot', sub: 'Upload a screenshot from a website or app', onClick: () => uploadRef.current.click() },
            { icon: '🔗', label: 'Paste a URL', sub: 'Scrape a recipe directly from a website', onClick: () => setUrlMode(true) },
            { icon: '✏️', label: 'Enter manually', sub: 'Type in a recipe from scratch', onClick: () => navigate("/add/manual") },
          ].map(({ icon, label, sub, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              style={{
                width: '100%', padding: '16px',
                background: '#ffffff', border: '1px solid #d4cdc0',
                borderRadius: '10px', textAlign: 'left', cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>{icon}</div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#3a3226' }}>{label}</div>
              <div style={{ fontSize: '13px', color: '#9a9080', marginTop: '3px' }}>{sub}</div>
            </button>
          ))}
        </div>

        <input ref={cameraRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={(e) => handleFile(e.target.files[0], "photo")} />
        <input ref={uploadRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFile(e.target.files[0], "screenshot")} />
      </div>
    </div>
  );
}
