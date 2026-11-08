import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";

export default function Dashboard() {
  const { user, enquiries, hostels } = useApp();
  const mine = enquiries.filter((e) => e.user === user.name);
  return (
    <>
      <h1>My booking requests</h1>
      {mine.length ? (
        <div className="scroll">
          <table>
            <thead><tr><th>Hostel</th><th>Room</th><th>Status</th></tr></thead>
            <tbody>
              {mine.map((e) => (
                <tr key={e.id}>
                  <td>{hostels.find((h) => h.id === e.hostelId)?.name}</td>
                  <td>{e.room}</td>
                  <td className={`st ${e.status}`}>{e.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="muted">No requests yet. <Link to="/listings">Find a hostel</Link>.</p>
      )}
    </>
  );
}
