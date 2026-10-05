import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { C, BORDER, backButtonStyle as BACK_BTN, pageTitleStyle, errorStyle } from "../components/Bauhaus.jsx";

const subtitleStyle = { fontSize: '11px', color: C.grey, margin: '0 0 20px' };

// Itten's three forms (plus an ink square) stand in for the option icons.
function Shape({ kind }) {
  const base = { width: '18px', height: '18px', boxSizing: 'border-box', border: BORDER };
  if (kind === 'circle') return <span aria-hidden style={{ ...base, display: 'block', borderRadius: '50%', background: C.red }} />;
  if (kind === 'square') return <span aria-hidden style={{ ...base, display: 'block', background: C.yellow }} />;
  if (kind === 'triangle') {
    return (
      <svg aria-hidden width="20" height="18" viewBox="0 0 20 18" style={{ display: 'block' }}>
        <polygon points="10,1.5 18.5,16.8 1.5,16.8" fill="var(--bh-blue)" stroke="var(--bh-ink)" strokeWidth="2" strokeLinejoin="miter" />
      </svg>
    );
  }
  return <span aria-hidden style={{ ...base, display: 'block', background: C.ink }} />;
}

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
      <div style={{ minHeight: '100vh', background: C.paper }}>
        <div style={{ padding: '24px 16px 32px' }}>
          <button onClick={() => { setUrlMode(false); setError(null); setUrl(""); }} style={BACK_BTN}>
            ← Back
          </button>
          <h1 style={pageTitleStyle}>Add from URL</h1>
          <p style={subtitleStyle}>Paste a link to a recipe page</p>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && url && extractFromUrl()}
            placeholder="https://..."
            autoFocus
            aria-label="Recipe URL"
            className="bh-input"
            style={{ marginBottom: '12px' }}
          />
          {error && (
            <p style={errorStyle}>
              {error}
            </p>
          )}
          <button
            onClick={extractFromUrl}
            disabled={loading || !url}
            className="bh-btn bh-btn-primary"
            style={{ width: '100%' }}
          >
            {loading ? <><LoadingSpinner small light /> Scraping recipe…</> : "Extract recipe →"}
          </button>
        </div>
      </div>
    );
  }

  if (preview) {
    return (
      <div style={{ minHeight: '100vh', background: C.paper }}>
        <div style={{ padding: '24px 16px 32px' }}>
          <button
            onClick={() => { setPreview(null); setImageData(null); }}
            style={BACK_BTN}
          >
            ← Back
          </button>
          <img src={preview} alt="Recipe" style={{ display: 'block', width: '100%', boxSizing: 'border-box', border: BORDER, objectFit: 'cover', maxHeight: '320px', marginBottom: '20px' }} />
          {error && (
            <p style={errorStyle}>
              {error}
            </p>
          )}
          <button
            onClick={extractRecipe}
            disabled={loading}
            className="bh-btn bh-btn-primary"
            style={{ width: '100%' }}
          >
            {loading ? <><LoadingSpinner small light /> Reading recipe…</> : "Extract recipe →"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: C.paper }}>
      <div style={{ padding: '24px 16px 32px' }}>
        <button
          onClick={() => navigate("/")}
          style={BACK_BTN}
        >
          ← Back
        </button>
        <h1 style={pageTitleStyle}>Add recipe</h1>
        <p style={subtitleStyle}>Choose how you'd like to add a recipe</p>

        <div className="flex flex-col" style={{ border: BORDER }}>
          {[
            { shape: 'circle', label: 'Take a photo', sub: 'Photograph a recipe from a book or card', onClick: () => cameraRef.current.click() },
            { shape: 'square', label: 'Upload screenshot', sub: 'Upload a screenshot from a website or app', onClick: () => uploadRef.current.click() },
            { shape: 'triangle', label: 'Paste a URL', sub: 'Scrape a recipe directly from a website', onClick: () => setUrlMode(true) },
            { shape: 'ink', label: 'Enter manually', sub: 'Type in a recipe from scratch', onClick: () => navigate("/add/manual") },
          ].map(({ shape, label, sub, onClick }, i) => (
            <button
              key={label}
              onClick={onClick}
              className="flex items-center text-left"
              style={{
                width: '100%', gap: '14px', padding: '14px 12px',
                background: i % 2 === 0 ? C.white : C.paper,
                border: 'none', borderTop: i === 0 ? 'none' : BORDER,
                borderRadius: 0, cursor: 'pointer',
              }}
            >
              <span className="flex shrink-0 items-center justify-center" style={{ width: '20px' }}><Shape kind={shape} /></span>
              <span>
                <span style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: C.ink }}>{label}</span>
                <span style={{ display: 'block', fontSize: '10px', color: C.grey, marginTop: '2px' }}>{sub}</span>
              </span>
            </button>
          ))}
        </div>

        <input ref={cameraRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={(e) => handleFile(e.target.files[0], "photo")} />
        <input ref={uploadRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFile(e.target.files[0], "screenshot")} />
      </div>
    </div>
  );
}
