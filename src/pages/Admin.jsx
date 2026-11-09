import { useState } from "react";
import { useApp, managerCodeOf } from "../context/AppContext.jsx";
import { AMENITIES } from "../data/hostels.js";
import { fileToDataUrl } from "../utils/image.js";

const ROOM_TYPES = ["1-in-a-room", "2-in-a-room", "3-in-a-room", "4-in-a-room"];
const BLANK = {
  name: "", area: "", price: 5000, dist: 1, available: 1,
  description: "", rooms: ["2-in-a-room"], amenities: [], photos: [], featured: false,
};

function Upload({ onFiles, label, multiple = true }) {
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

function HostelForm({ initial, onSave, onCancel }) {
  const [f, setF] = useState(initial);
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const toggle = (k, v) =>
    setF((x) => ({ ...x, [k]: x[k].includes(v) ? x[k].filter((i) => i !== v) : [...x[k], v] }));

  const submit = (e) => {
    e.preventDefault();
    if (!f.name.trim() || !f.area.trim()) return alert("Name and area are required.");
    if (!f.rooms.length) return alert("Choose at least one room type.");
    onSave({
      ...f,
      name: f.name.trim(),
      area: f.area.trim(),
      price: Number(f.price) || 0,
      dist: Number(f.dist) || 0,
      available: Math.max(0, Number(f.available) || 0),
    });
  };

  return (
    <form className="admin-form" onSubmit={submit}>
      <div className="filters">
        <label>Name<input value={f.name} onChange={(e) => set("name", e.target.value)} /></label>
        <label>Area<input value={f.area} onChange={(e) => set("area", e.target.value)} /></label>
        <label>Price per year (GH₵)<input type="number" min="0" value={f.price} onChange={(e) => set("price", e.target.value)} /></label>
        <label>Distance (km)<input type="number" min="0" step="0.1" value={f.dist} onChange={(e) => set("dist", e.target.value)} /></label>
        <label>Rooms available<input type="number" min="0" value={f.available} onChange={(e) => set("available", e.target.value)} /></label>
      </div>
      <label>Description<textarea rows="2" value={f.description} onChange={(e) => set("description", e.target.value)} /></label>
      <div className="chk">
        <label>Room types</label>
        {ROOM_TYPES.map((r) => (
          <label key={r}><input type="checkbox" checked={f.rooms.includes(r)} onChange={() => toggle("rooms", r)} />{r}</label>
        ))}
      </div>
      <div className="chk">
        <label>Amenities</label>
        {AMENITIES.map((a) => (
          <label key={a}><input type="checkbox" checked={f.amenities.includes(a)} onChange={() => toggle("amenities", a)} />{a}</label>
        ))}
      </div>
      <p>
        <button className="btn">Save hostel</button>{" "}
        <button type="button" className="btn alt" onClick={onCancel}>Cancel</button>
      </p>
    </form>
  );
}

export default function Admin() {
  const app = useApp();
  const { hostels, enquiries, banner, saveError } = app;
  const [tab, setTab] = useState("hostels");
  const [editing, setEditing] = useState(null); // hostel id, or "new"
  const [filter, setFilter] = useState("All");

  const pending = enquiries.filter((e) => e.status === "Pending").length;
  const approved = enquiries.filter((e) => e.status === "Approved").length;
  const rooms = hostels.reduce((n, h) => n + h.available, 0);
  const shown = enquiries.filter((e) => filter === "All" || e.status === filter);
  const nameOf = (id) => hostels.find((h) => h.id === id)?.name || "(deleted hostel)";

  return (
    <>
      <h1>Admin panel</h1>
      {saveError && (
        <div className="msg warn">
          Browser storage is full, so recent changes may not be saved. Remove some photos or use smaller images.
        </div>
      )}

      <div className="stats">
        <div className="card"><div className="body"><strong>{hostels.length}</strong><span className="muted">Hostels</span></div></div>
        <div className="card"><div className="body"><strong>{rooms}</strong><span className="muted">Rooms available</span></div></div>
        <div className="card"><div className="body"><strong>{pending}</strong><span className="muted">Pending enquiries</span></div></div>
        <div className="card"><div className="body"><strong>{approved}</strong><span className="muted">Approved</span></div></div>
      </div>

      <div className="tabs">
        {[["hostels", "Hostels and photos"], ["home", "Home page"], ["enquiries", "Enquiries"]].map(([k, t]) => (
          <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{t}</button>
        ))}
      </div>

      {tab === "hostels" && (
        <>
          <p>
            <button className="btn" onClick={() => setEditing(editing === "new" ? null : "new")}>
              {editing === "new" ? "Close" : "+ Add new hostel"}
            </button>
          </p>
          {editing === "new" && (
            <div className="card"><div className="body">
              <h3>New hostel</h3>
              <HostelForm
                initial={BLANK}
                onCancel={() => setEditing(null)}
                onSave={(d) => { app.addHostel(d); setEditing(null); }}
              />
            </div></div>
          )}
          {hostels.map((h) => (
            <div className="card admin-item" key={h.id}>
              <div className="body">
                <div className="row">
                  <h3>{h.name}</h3>
                  <span className="muted">{h.area} · GH₵{h.price.toLocaleString()} · {h.dist} km · Manager code: <code>{managerCodeOf(h)}</code></span>
                </div>
                <div className="thumbs">
                  {h.photos?.length ? h.photos.map((p, i) => (
                    <div className="thumb" key={i}>
                      <img src={p} alt={`${h.name} ${i + 1}`} />
                      <button type="button" aria-label="Remove photo" onClick={() => app.removePhoto(h.id, i)}>×</button>
                    </div>
                  )) : <span className="muted">No photos yet.</span>}
                </div>
                <div className="row">
                  <Upload label="Upload photos" onFiles={(urls) => app.addPhotos(h.id, urls)} />
                  <label className="inline">
                    <input type="checkbox" checked={!!h.featured} onChange={(e) => app.updateHostel(h.id, { featured: e.target.checked })} />
                    Show on home page
                  </label>
                  <label className="inline">
                    Rooms available
                    <input type="number" min="0" style={{ width: "5rem" }} value={h.available}
                      onChange={(e) => app.updateHostel(h.id, { available: Math.max(0, Number(e.target.value) || 0) })} />
                  </label>
                  <button className="btn alt" onClick={() => setEditing(editing === h.id ? null : h.id)}>
                    {editing === h.id ? "Close" : "Edit details"}
                  </button>
                  <button className="btn alt" onClick={() => window.confirm(`Delete ${h.name}?`) && app.deleteHostel(h.id)}>Delete</button>
                </div>
                {editing === h.id && (
                  <HostelForm
                    initial={h}
                    onCancel={() => setEditing(null)}
                    onSave={(d) => { app.updateHostel(h.id, d); setEditing(null); }}
                  />
                )}
              </div>
            </div>
          ))}
          <p>
            <button className="btn alt" onClick={() => window.confirm("Reset all hostels and the banner to the sample data?") && app.resetData()}>
              Reset sample data
            </button>
          </p>
        </>
      )}

      {tab === "home" && (
        <div className="card"><div className="body">
          <h3>Home page banner</h3>
          <p className="muted">This image appears behind the headline on the home page. Use a wide landscape photo.</p>
          {banner && <img className="banner-preview" src={banner} alt="Home page banner" />}
          <div className="row">
            <Upload label={banner ? "Replace banner" : "Upload banner"} multiple={false} onFiles={(urls) => app.setBanner(urls[0])} />
            {banner && <button className="btn alt" onClick={() => app.setBanner(null)}>Remove banner</button>}
          </div>
          <h3 style={{ marginTop: "1.5rem" }}>Featured hostels</h3>
          <p className="muted">
            Currently featured: {hostels.filter((h) => h.featured).map((h) => h.name).join(", ") || "none (the first three hostels with rooms are shown)"}.
            Change this with the "Show on home page" tick box in the Hostels tab.
          </p>
        </div></div>
      )}

      {tab === "enquiries" && (
        <>
          <label style={{ maxWidth: 220 }}>Filter by status
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              {["All", "Pending", "Approved", "Declined"].map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
          {shown.length ? (
            <div className="scroll">
              <table>
                <thead><tr><th>Student</th><th>Hostel</th><th>Room</th><th>Message</th><th>Status</th></tr></thead>
                <tbody>
                  {shown.map((e) => (
                    <tr key={e.id}>
                      <td>{e.user}</td>
                      <td>{nameOf(e.hostelId)}</td>
                      <td>{e.room}</td>
                      <td>{e.message || "-"}</td>
                      <td>
                        <select value={e.status} onChange={(ev) => app.setStatus(e.id, ev.target.value)}>
                          {["Pending", "Approved", "Declined"].map((s) => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="muted">No enquiries to show.</p>
          )}
        </>
      )}
    </>
  );
}