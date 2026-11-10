import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp, ADMIN_PASSCODE } from "../context/AppContext.jsx";

export default function Login() {
  const { signIn, signInStudent, hostels } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isManager, setIsManager] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [name, setName] = useState("");
  const [hostelId, setHostelId] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Admin login
    if (isAdmin) {
      if (password !== ADMIN_PASSCODE) return setError("Wrong admin passcode.");
      signIn({ name: "Administrator", role: "admin" });
      return navigate("/admin");
    }

    // Manager login
    if (isManager) {
      const h = hostels.find((x) => x.id === Number(hostelId));
      if (!h) return setError("Please choose your hostel.");
      if (password.trim() !== (h.managerCode || `MGR${h.id}`)) return setError("Wrong access code for this hostel.");
      signIn({ name: name.trim() || `${h.name} manager`, role: "manager", hostelId: h.id });
      return navigate("/manager");
    }

    // Student login
    setBusy(true);
    const res = await signInStudent(email, password);
    setBusy(false);
    if (!res.ok) return setError(res.error);
    navigate("/dashboard");
  };

  return (
    <>
      <h1>Sign in</h1>
      <form className="card" onSubmit={handleSubmit}>
        <div className="body">
          {/* Checkboxes */}
          <div className="chk">
            <label>
              <input type="checkbox" checked={isManager} onChange={() => { setIsManager(!isManager); setIsAdmin(false); setError(""); }} />
              I am a hostel manager
            </label>
            <label>
              <input type="checkbox" checked={isAdmin} onChange={() => { setIsAdmin(!isAdmin); setIsManager(false); setError(""); }} />
              I am an admin
            </label>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid var(--line)", margin: ".8rem 0" }} />

          {/* Admin login */}
          {isAdmin && (
            <>
              <label htmlFor="pw">Admin passcode</label>
              <input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter admin passcode" />
            </>
          )}

          {/* Manager login */}
          {isManager && (
            <>
              <label htmlFor="nm">Your name</label>
              <input id="nm" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Mr. Mensah" />
              <label htmlFor="hs" style={{ marginTop: ".6rem" }}>Your hostel</label>
              <select id="hs" value={hostelId} onChange={(e) => setHostelId(e.target.value)}>
                <option value="">Choose a hostel</option>
                {hostels.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
              <label htmlFor="pw" style={{ marginTop: ".6rem" }}>Access code</label>
              <input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Ask the admin for your code" />
            </>
          )}

          {/* Student login */}
          {!isManager && !isAdmin && (
            <>
              <label htmlFor="em">Email</label>
              <input id="em" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <label htmlFor="pw" style={{ marginTop: ".6rem" }}>Password</label>
              <input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </>
          )}

          {error && <p className="st Declined" style={{ marginTop: ".6rem" }}>{error}</p>}
          <p style={{ marginTop: ".8rem" }}>
            <button className="btn" disabled={busy}>
              {busy ? "Signing in..." : isAdmin ? "Sign in as admin" : isManager ? "Sign in as manager" : "Sign in as student"}
            </button>
          </p>
          {!isManager && !isAdmin && <p className="muted">New here? <Link to="/signup">Create an account</Link></p>}
        </div>
      </form>
    </>
  );
}