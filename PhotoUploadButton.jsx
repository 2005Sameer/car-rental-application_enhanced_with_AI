import React, { useRef, useState } from "react";
import { Camera } from "lucide-react";

// Hidden file input behind a small button. onUpload receives the raw File
// and should return a promise (the caller decides which endpoint to hit —
// owner listings and admin fleet cars use different routes for the same
// underlying upload).
export default function PhotoUploadButton({ onUpload, label = "Photo" }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onChange(e) {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      await onUpload(file);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <span style={{ display: "inline-flex", flexDirection: "column", gap: 4 }}>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }} onChange={onChange} />
      <button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={() => inputRef.current.click()}>
        <Camera size={14} /> {busy ? "Uploading..." : label}
      </button>
      {error && <span style={{ color: "var(--danger)", fontSize: 11.5 }}>{error}</span>}
    </span>
  );
}
