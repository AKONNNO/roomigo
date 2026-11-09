import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";

export default function Signup() {
  const { signUp } = useApp();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const go = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) return setError("The two passwords do not match.");
    setBusy(true);
    const res = await signUp(name, email, password);
    setBusy(false);
    if (!res.ok) return setError(res.error);
    navigate("/dashboard");
  };

  return (
    <>
      <h1>Create a student account</h1>
      <form className="card" onSubmit={go}>
        <div className="body">
          <label htmlFor="sn">Full name</label>
          <input id="sn" value={name} onChange={(e) => setName(e.target.value)} />
          <label htmlFor="se" style={{ marginTop: ".6rem" }}>Email</label>
          <input id="se" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <label htmlFor="sp" style={{ marginTop: ".6rem" }}>Password (at least 6 characters)</label>
          <input id="sp" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <label htmlFor="sc" style={{ marginTop: ".6rem" }}>Confirm password</label>
          <input id="sc" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          {error && <p className="st Declined">{error}</p>}
          <p><button className="btn" disabled={busy}>{busy ? "Creating..." : "Sign up"}</button></p>
          <p className="muted">Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </form>
    </>
  );
}