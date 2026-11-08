import { useMemo, useState } from "react";
import HostelCard from "../components/HostelCard.jsx";
import { AMENITIES } from "../data/hostels.js";
import { useApp } from "../context/AppContext.jsx";

export default function Listings() {
  const { hostels } = useApp();
  const [q, setQ] = useState("");
  const [maxPrice, setMaxPrice] = useState(9000);
  const [maxDist, setMaxDist] = useState(5);
  const [picked, setPicked] = useState([]);

  const toggle = (a) => setPicked((p) => (p.includes(a) ? p.filter((x) => x !== a) : [...p, a]));

  const results = useMemo(
    () =>
      hostels.filter(
        (h) =>
          `${h.name} ${h.area}`.toLowerCase().includes(q.toLowerCase()) &&
          h.price <= maxPrice &&
          h.dist <= maxDist &&
          picked.every((a) => h.amenities.includes(a))
      ),
    [hostels, q, maxPrice, maxDist, picked]
  );

  return (
    <>
      <h1>Find a hostel</h1>
      <div className="filters">
        <div>
          <label htmlFor="q">Search name or area</label>
          <input id="q" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div>
          <label htmlFor="mx">Max price: GH₵{maxPrice.toLocaleString()}</label>
          <input id="mx" type="range" min="3000" max="9000" step="100" value={maxPrice} onChange={(e) => setMaxPrice(+e.target.value)} />
        </div>
        <div>
          <label htmlFor="ds">Max distance: {maxDist} km</label>
          <input id="ds" type="range" min="0.5" max="5" step="0.1" value={maxDist} onChange={(e) => setMaxDist(+e.target.value)} />
        </div>
        <div className="chk">
          <label>Amenities</label>
          {AMENITIES.map((a) => (
            <label key={a}><input type="checkbox" checked={picked.includes(a)} onChange={() => toggle(a)} />{a}</label>
          ))}
        </div>
      </div>
      <div className="grid">
        {results.length ? results.map((h) => <HostelCard key={h.id} hostel={h} />) : <p className="muted">No hostels match these filters.</p>}
      </div>
    </>
  );
}
