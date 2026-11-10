import { useState } from "react";
import { uploadImage } from "../lib/supabase-service.js";

export default function ImageUpload({ onFiles, label, multiple = true }) {
  const [busy, setBusy] = useState(false);
  const pick = async (e) => {
    const files = [...e.target.files].filter((f) => f.type.startsWith("image/"));
    e.target.value = "";
    if (!files.length) return;
    setBusy(true);
    try {
      const urls = [];
      for (const f of files) {
        const url = await uploadImage(f);
        if (url) urls.push(url);
      }
      if (urls.length) onFiles(urls);
      if (urls.length < files.length) alert("Some images failed to upload.");
    } catch {
      alert("One of the images could not be read.");
    }
    setBusy(false);
  };
  return (
    <label className="btn alt upload">
      {busy ? "Uploading..." : label}
      <input type="file" accept="image/*" multiple={multiple} onChange={pick} hidden />
    </label>
  );
}