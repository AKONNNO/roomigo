import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp, ADMIN_PASSCODE } from "../context/AppContext.jsx";

export default function AdminLogin() {
  const { signIn } = useApp();
  const navigate = useNavigate();
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  const go = (e) => {
    e.preventDefault();
    if (pass !== ADMIN_PASSCODE) return setError("Wrong passcode.");
    signIn({ name: "Administrator", role: "admin" });
    navigate("/admin");
  };

  return (
    <>
      <h1>Administrator sign in</h1>
      <form className="card" onSubmit={go}>
        <div className="body">
          <label htmlFor="ps">Admin passcode</label>
          <input id="ps" type="password" value={pass} onChange={(e) => setPass(e.target.value)} />
          {error && <p className="st Declined">{error}</p>}
          <p><button className="btn">Sign in</button></p>
        </div>
      </form>
    </>
  );
}