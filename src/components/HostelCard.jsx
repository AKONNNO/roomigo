import { Link } from "react-router-dom";
import Photo from "./Photo.jsx";

export default function HostelCard({ hostel: h }) {
  return (
    <article className="card">
      <Photo hostel={h} className="pic" />
      <div className="body">
        <h3>{h.name}</h3>
        <div className="muted">{h.area} · {h.dist} km from campus</div>
        <p>
          <strong>GH₵{h.price.toLocaleString()}</strong> <span className="muted">per year</span> ·{" "}
          {h.available ? `${h.available} rooms left` : "Full"}
        </p>
        <div>{h.amenities.map((a) => <span className="tag" key={a}>{a}</span>)}</div>
        <p><Link className="btn" to={`/hostel/${h.id}`}>View details</Link></p>
      </div>
    </article>
  );
}