import { Link } from "react-router-dom";
import HostelCard from "../components/HostelCard.jsx";
import { useApp } from "../context/AppContext.jsx";

export default function Home() {
  const { hostels } = useApp();
  return (
    <>
      <section className="hero">
        <h1>Find your KNUST hostel without the agent fees.</h1>
        <p>Search verified off-campus hostels, compare prices and distance, and send a booking enquiry in minutes.</p>
        <Link className="btn" to="/listings">Start searching</Link>
      </section>
      <h2>Featured hostels</h2>
      <div className="grid">
        {hostels.filter((h) => h.available > 0).slice(0, 3).map((h) => <HostelCard key={h.id} hostel={h} />)}
      </div>
    </>
  );
}
