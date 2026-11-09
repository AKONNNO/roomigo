import { useState } from "react";
import { fileToDataUrl } from "../utils/image.js";

export default function ImageUpload({ onFiles, label, multiple = true }) {
  const [busy, setBusy] = useState(false);
  const pick = async (e) => {
    const files = [...e.target.files].filter((f) => f.type.startsWith("image/"));
    e.target.value = "";
    if (!files.length) return;
    setBusy(true);
    try {
      onFiles(await Promise.all(files.map((f) => fileToDataUrl(f))));
    } catch {
      alert("One of the images could not be read.");
    }
    setBusy(false);
  };
  return (
    <label className="btn alt upload">
      {busy ? "Processing..." : label}
      <input type="file" accept="image/*" multiple={multiple} onChange={pick} hidden />
    </label>
  );
}