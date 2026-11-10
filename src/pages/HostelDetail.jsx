import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { AMENITIES } from "../data/hostels.js";
import { useApp } from "../context/AppContext.jsx";
import Photo from "../components/Photo.jsx";

export default function HostelDetail() {
  const { id } = useParams();
  const { hostels, user, addEnquiry } = useApp();
  const h = hostels.find((x) => x.id === Number(id));
  const [room, setRoom] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [lightbox, setLightbox] = useState(null); // index of lightbox photo

  // Close lightbox on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") setLightbox(null); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (!h) return <p>Hostel not found. <Link to="/listings">Back to results</Link></p>;

  const allPhotos = h.photos || [];
  const heroPhoto = allPhotos[0];
  const heroSrc = heroPhoto
    ? (heroPhoto.startsWith("/") ? heroPhoto : `/${heroPhoto}`)
    : null;
  const thumbs = allPhotos.slice(1);

  const rooms = h.rooms || [];
  const submit = (e) => {
    e.preventDefault();
    addEnquiry(h.id, room || rooms[0], message.trim());
    setMessage("");
    setSent(true);
  };

  // Get all images for lightbox including room photos
  const lightboxPhotos = allPhotos.map((p) => ({
    src: p.startsWith("/") ? p : `/${p}`,
    label: h.name,
  }));

  return (
    <>
      <p><Link to="/listings">← Back to results</Link></p>

      {/* Hero image */}
      {heroSrc && (
        <div className="hero-img" onClick={() => setLightbox(0)}>
          <img src={heroSrc} alt={h.name} />
          <div className="hero-overlay">
            <span>View all {allPhotos.length} photo{allPhotos.length !== 1 ? "s" : ""}</span>
          </div>
        </div>
      )}

      {/* Thumbnails */}
      {allPhotos.length > 1 && (
        <div className="photo-strip">
          {allPhotos.map((p, i) => {
            const src = p.startsWith("/") ? p : `/${p}`;
            return (
              <button key={i} className="photo-thumb" onClick={() => setLightbox(i)}>
                <img src={src} alt={`Photo ${i + 1}`} />
              </button>
            );
          })}
        </div>
      )}

      <div className="two">
        <div>
          <h1>{h.name}</h1>
          <p className="muted">{h.area} · {h.dist} km from campus</p>
          <p>{h.description}</p>
          <h3>Facilities</h3>
          <ul>{AMENITIES.map((a) => <li key={a}>{h.amenities.includes(a) ? "✔" : "✘"} {a}</li>)}</ul>
          <p><strong>GH₵{h.price.toLocaleString()}</strong> per year · {h.available ? `${h.available} rooms available` : "No rooms available"}</p>

          <h3>Room types</h3>
          {rooms.length === 0 && <p className="muted">Room details coming soon.</p>}
          {rooms.map((t) => {
            const pics = h.roomPhotos?.[t] || [];
            return (
              <div key={t} className="room-block">
                <strong>{t}</strong>
                {pics.length ? (
                  <div className="room-photos">
                    {pics.map((p, i) => {
                      const fixedSrc = p?.startsWith("/") ? p : `/${p}`;
                      return <img key={i} className="room-img" src={fixedSrc} alt={`${t} room ${i + 1}`} loading="lazy" onError={(e) => (e.target.style.display = "none")} />;
                    })}
                  </div>
                ) : (
                  <p className="muted">Room photos coming soon.</p>
                )}
              </div>
            );
          })}
        </div>
        <div className="card">
          <div className="body">
            <h3>Send a booking enquiry</h3>
            {!user && <p>Please <Link to="/login">sign in</Link> as a student to send an enquiry.</p>}
            {user && user.role !== "student" && <p className="muted">Only students can send enquiries.</p>}
            {user?.role === "student" && (
              <form onSubmit={submit}>
                <label htmlFor="rt">Room type</label>
                <select id="rt" value={room || rooms[0] || ""} onChange={(e) => setRoom(e.target.value)}>
                  {rooms.map((r) => <option key={r}>{r}</option>)}
                </select>
                <label htmlFor="mg" style={{ marginTop: ".6rem" }}>Message</label>
                <textarea id="mg" rows="3" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Any questions?" />
                <p><button className="btn" disabled={!h.available || !rooms.length}>{h.available ? "Submit enquiry" : "Fully booked"}</button></p>
                {sent && <div className="msg">Enquiry sent. Track it under <Link to="/dashboard">My requests</Link>.</div>}
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox overlay */}
      {lightbox !== null && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <button className="lightbox-close" onClick={() => setLightbox(null)}>×</button>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={lightboxPhotos[lightbox].src} alt={lightboxPhotos[lightbox].label} />
            {allPhotos.length > 1 && (
              <div className="lightbox-nav">
                <button
                  disabled={lightbox === 0}
                  onClick={(e) => { e.stopPropagation(); setLightbox(lightbox - 1); }}
                >‹</button>
                <span>{lightbox + 1} / {allPhotos.length}</span>
                <button
                  disabled={lightbox === allPhotos.length - 1}
                  onClick={(e) => { e.stopPropagation(); setLightbox(lightbox + 1); }}
                >›</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}