import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AMENITIES, HUES } from "../data/hostels.js";
import { useApp } from "../context/AppContext.jsx";

export default function HostelDetail() {
  const { id } = useParams();
  const { hostels, user, addEnquiry } = useApp();
  const h = hostels.find((x) => x.id === Number(id));
  const [room, setRoom] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  if (!h) return <p>Hostel not found. <Link to="/listings">Back to results</Link></p>;

  const submit = (e) => {
    e.preventDefault();
    addEnquiry(h.id, room || h.rooms[0], message.trim());
    setMessage("");
    setSent(true);
  };

  return (
    <>
      <p><Link to="/listings">← Back to results</Link></p>
      <div className="gal">
        {["🛏️", "🚿", "🍳"].map((e, k) => (
          <div key={e} style={{ background: HUES[(h.id + k) % HUES.length] }}>{e}</div>
        ))}
      </div>
      <div className="two">
        <div>
          <h1>{h.name}</h1>
          <p className="muted">{h.area} · {h.dist} km from campus</p>
          <p>{h.description}</p>
          <h3>Facilities</h3>
          <ul>{AMENITIES.map((a) => <li key={a}>{h.amenities.includes(a) ? "✔" : "✘"} {a}</li>)}</ul>
          <p><strong>GH₵{h.price.toLocaleString()}</strong> per year · {h.available ? `${h.available} rooms available` : "No rooms available"}</p>
        </div>
        <div className="card">
          <div className="body">
            <h3>Send a booking enquiry</h3>
            {!user && <p>Please <Link to="/login">sign in</Link> as a student to send an enquiry.</p>}
            {user?.role === "admin" && <p className="muted">Admins cannot send enquiries.</p>}
            {user?.role === "student" && (
              <form onSubmit={submit}>
                <label htmlFor="rt">Room type</label>
                <select id="rt" value={room || h.rooms[0]} onChange={(e) => setRoom(e.target.value)}>
                  {h.rooms.map((r) => <option key={r}>{r}</option>)}
                </select>
                <label htmlFor="mg" style={{ marginTop: ".6rem" }}>Message</label>
                <textarea id="mg" rows="3" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Any questions?" />
                <p><button className="btn" disabled={!h.available}>{h.available ? "Submit enquiry" : "Fully booked"}</button></p>
                {sent && <div className="msg">Enquiry sent. Track it under <Link to="/dashboard">My requests</Link>.</div>}
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
