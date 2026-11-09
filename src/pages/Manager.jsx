import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { AMENITIES } from "../data/hostels.js";
import ImageUpload from "../components/ImageUpload.jsx";

const ROOM_TYPES = ["1-in-a-room", "2-in-a-room", "3-in-a-room", "4-in-a-room"];

export default function Manager() {
  const app = useApp();
  const { user, hostels, enquiries, saveError } = app;
  const h = hostels.find((x) => x.id === user.hostelId);
  const [filter, setFilter] = useState("All");

  if (!h) return <p>Your hostel was not found. Please contact the administrator.</p>;

  const offered = h.rooms || [];
  const roomPhotos = h.roomPhotos || {};
  const missing = offered.filter((t) => !(roomPhotos[t]?.length > 0));
  const mine = enquiries.filter((e) => e.hostelId === h.id);
  const shown = mine.filter((e) => filter === "All" || e.status === filter);
  const pending = mine.filter((e) => e.status === "Pending").length;

  const toggleRoom = (t) =>
    app.updateHostel(h.id, { rooms: offered.includes(t) ? offered.filter((x) => x !== t) : [...offered, t] });
  const toggleAmenity = (a) =>
    app.updateHostel(h.id, { amenities: h.amenities.includes(a) ? h.amenities.filter((x) => x !== a) : [...h.amenities, a] });

  return (
    <>
      <h1>{h.name}</h1>
      <p className="muted">Hostel manager panel. You can only see and change this hostel.</p>
      {saveError && <div className="msg warn">Browser storage is full, so recent changes may not be saved. Remove some photos or use smaller images.</div>}

      <div className="stats">
        <div className="card"><div className="body"><strong>{h.available}</strong><span className="muted">Rooms available</span></div></div>
        <div className="card"><div className="body"><strong>{offered.length}</strong><span className="muted">Room types offered</span></div></div>
        <div className="card"><div className="body"><strong>{pending}</strong><span className="muted">Pending enquiries</span></div></div>
      </div>

      <h2>Room types and room photos</h2>
      <p className="muted">Tick each room type you offer, then upload photos of the inside of that room. Students see these photos on your hostel's page.</p>
      {missing.length > 0 && (
        <div className="msg warn">Photos still needed for: {missing.join(", ")}.</div>
      )}
      {ROOM_TYPES.map((t) => {
        const on = offered.includes(t);
        const pics = roomPhotos[t] || [];
        return (
          <div className="card admin-item" key={t}>
            <div className="body">
              <label className="inline">
                <input type="checkbox" checked={on} onChange={() => toggleRoom(t)} />
                <strong>{t}</strong>
              </label>
              {on && (
                <>
                  <div className="thumbs">
                    {pics.length ? pics.map((p, i) => (
                      <div className="thumb" key={i}>
                        <img src={p} alt={`${t} ${i + 1}`} />
                        <button type="button" aria-label="Remove photo" onClick={() => app.removeRoomPhoto(h.id, t, i)}>×</button>
                      </div>
                    )) : <span className="badge-warn">Needs at least one photo</span>}
                  </div>
                  <ImageUpload label={`Upload ${t} photos`} onFiles={(urls) => app.addRoomPhotos(h.id, t, urls)} />
                </>
              )}
            </div>
          </div>
        );
      })}

      <h2>Hostel photos</h2>
      <p className="muted">General photos of the building, shown on the hostel card and its page.</p>
      <div className="thumbs">
        {h.photos?.length ? h.photos.map((p, i) => (
          <div className="thumb" key={i}>
            <img src={p} alt={`${h.name} ${i + 1}`} />
            <button type="button" aria-label="Remove photo" onClick={() => app.removePhoto(h.id, i)}>×</button>
          </div>
        )) : <span className="muted">No photos yet.</span>}
      </div>
      <ImageUpload label="Upload hostel photos" onFiles={(urls) => app.addPhotos(h.id, urls)} />

      <h2>Hostel details</h2>
      <div className="card"><div className="body">
        <div className="filters">
          <label>Price per year (GH₵)
            <input type="number" min="0" value={h.price} onChange={(e) => app.updateHostel(h.id, { price: Number(e.target.value) || 0 })} />
          </label>
          <label>Rooms available
            <input type="number" min="0" value={h.available} onChange={(e) => app.updateHostel(h.id, { available: Math.max(0, Number(e.target.value) || 0) })} />
          </label>
        </div>
        <label>Description
          <textarea rows="2" value={h.description} onChange={(e) => app.updateHostel(h.id, { description: e.target.value })} />
        </label>
        <div className="chk">
          <label>Amenities</label>
          {AMENITIES.map((a) => (
            <label key={a}><input type="checkbox" checked={h.amenities.includes(a)} onChange={() => toggleAmenity(a)} />{a}</label>
          ))}
        </div>
      </div></div>

      <h2>Enquiries for your hostel</h2>
      <label style={{ maxWidth: 220 }}>Filter by status
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          {["All", "Pending", "Approved", "Declined"].map((s) => <option key={s}>{s}</option>)}
        </select>
      </label>
      {shown.length ? (
        <div className="scroll">
          <table>
            <thead><tr><th>Student</th><th>Room</th><th>Message</th><th>Status</th></tr></thead>
            <tbody>
              {shown.map((e) => (
                <tr key={e.id}>
                  <td>{e.user}</td>
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
  );
}