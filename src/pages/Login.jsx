import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp, managerCodeOf } from "../context/AppContext.jsx";

export default function Login() {
  const { signIn, signInStudent, hostels } = useApp();
  const navigate = useNavigate();
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [hostelId, setHostelId] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const go = async (e) => {
    e.preventDefault();
    setError("");
    if (role === "manager") {
      const h = hostels.find((x) => x.id === Number(hostelId));
      if (!h) return setError("Please choose your hostel.");
      if (code.trim() !== managerCodeOf(h)) return setError("Wrong access code for this hostel.");
      signIn({ name: name.trim() || `${h.name} manager`, role: "manager", hostelId: h.id });
      return navigate("/manager");
    }
    setBusy(true);
    const res = await signInStudent(email, password);
    setBusy(false);
    if (!res.ok) return setError(res.error);
    navigate("/dashboard");
  };

  return (
    <>
      <h1>Sign in</h1>
      <form className="card" onSubmit={go}>
        <div className="body">
          <label htmlFor="rl">I am a</label>
          <select id="rl" value={role} onChange={(e) => { setRole(e.target.value); setError(""); }}>
            <option value="student">Student</option>
            <option value="manager">Hostel manager</option>
          </select>

          {role === "student" ? (
            <>
              <label htmlFor="em" style={{ marginTop: ".6rem" }}>Email</label>
              <input id="em" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <label htmlFor="pw" style={{ marginTop: ".6rem" }}>Password</label>
              <input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </>
          ) : (
            <>
              <label htmlFor="nm" style={{ marginTop: ".6rem" }}>Your name</label>
              <input id="nm" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Mr. Mensah" />
              <label htmlFor="hs" style={{ marginTop: ".6rem" }}>Your hostel</label>
              <select id="hs" value={hostelId} onChange={(e) => setHostelId(e.target.value)}>
                <option value="">Choose a hostel</option>
                {hostels.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
              <label htmlFor="cd" style={{ marginTop: ".6rem" }}>Access code</label>
              <input id="cd" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Given to you by the administrator" />
            </>
          )}

          {error && <p className="st Declined">{error}</p>}
          <p><button className="btn" disabled={busy}>{busy ? "Signing in..." : "Sign in"}</button></p>
          {role === "student" && <p className="muted">New here? <Link to="/signup">Create an account</Link></p>}
        </div>
      </form>
    </>
  );
}