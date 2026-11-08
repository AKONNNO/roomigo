import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";

// Demo sign-in only. Real authentication (backend/Firebase) is a later milestone.
export default function Login() {
  const { signIn } = useApp();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [role, setRole] = useState("student");

  const go = (e) => {
    e.preventDefault();
    signIn(name.trim(), role);
    navigate(role === "admin" ? "/admin" : "/dashboard");
  };

  return (
    <>
      <h1>Sign in</h1>
      <form className="card" onSubmit={go}>
        <div className="body">
          <p className="muted">Demo sign in for the prototype.</p>
          <label htmlFor="nm">Your name</label>
          <input id="nm" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ama" />
          <label htmlFor="rl" style={{ marginTop: ".6rem" }}>I am a</label>
          <select id="rl" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="student">Student</option>
            <option value="admin">Administrator</option>
          </select>
          <p><button className="btn">Continue</button></p>
        </div>
      </form>
    </>
  );
}
