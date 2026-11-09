import { Link } from "react-router-dom";
import HostelCard from "../components/HostelCard.jsx";
import { useApp } from "../context/AppContext.jsx";

export default function Home() {
  const { hostels, banner } = useApp();
  const chosen = hostels.filter((h) => h.featured);
  const featured = chosen.length ? chosen : hostels.filter((h) => h.available > 0).slice(0, 3);

  const style = banner
    ? { backgroundImage: `linear-gradient(rgba(0,0,0,.55), rgba(0,0,0,.55)), url(${banner})`, backgroundSize: "cover", backgroundPosition: "center" }
    : undefined;

  return (
    <>
      <section className={`hero ${banner ? "has-banner" : ""}`} style={style}>
        <h1>Find your KNUST hostel without the agent fees.</h1>
        <p>Search verified off-campus hostels, compare prices and distance, and send a booking enquiry in minutes.</p>
        <Link className="btn" to="/listings">Start searching</Link>
      </section>
      <h2>Featured hostels</h2>
      <div className="grid">
        {featured.map((h) => <HostelCard key={h.id} hostel={h} />)}
      </div>
    </>
  );
}