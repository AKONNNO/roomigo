import { useApp } from "../context/AppContext.jsx";

export default function Admin() {
  const { hostels, enquiries, setStatus, setAvailable } = useApp();
  return (
    <>
      <h1>Admin panel</h1>
      <h2>Listings</h2>
      <div className="scroll">
        <table>
          <thead><tr><th>Hostel</th><th>Price</th><th>Rooms available</th></tr></thead>
          <tbody>
            {hostels.map((h) => (
              <tr key={h.id}>
                <td>{h.name}</td>
                <td>GH₵{h.price.toLocaleString()}</td>
                <td><input type="number" min="0" style={{ width: "5rem" }} value={h.available} onChange={(e) => setAvailable(h.id, Number(e.target.value) || 0)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2>Enquiries</h2>
      {enquiries.length ? (
        <div className="scroll">
          <table>
            <thead><tr><th>Student</th><th>Hostel</th><th>Room</th><th>Message</th><th>Status</th></tr></thead>
            <tbody>
              {enquiries.map((e) => (
                <tr key={e.id}>
                  <td>{e.user}</td>
                  <td>{hostels.find((h) => h.id === e.hostelId)?.name}</td>
                  <td>{e.room}</td>
                  <td>{e.message || "-"}</td>
                  <td>
                    <select value={e.status} onChange={(ev) => setStatus(e.id, ev.target.value)}>
                      {["Pending", "Approved", "Declined"].map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="muted">No enquiries yet.</p>
      )}
    </>
  );
}
