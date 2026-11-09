import { NavLink, Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";

export default function Navbar() {
  const { user, signOut } = useApp();
  const navigate = useNavigate();
  return (
    <header>
      <nav>
        <Link className="logo" to="/">Roomigo</Link>
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/listings">Find a hostel</NavLink>
        {user?.role === "student" && <NavLink to="/dashboard">My requests</NavLink>}
        {user?.role === "manager" && <NavLink to="/manager">My hostel</NavLink>}
        {user?.role === "admin" && <NavLink to="/admin">Admin panel</NavLink>}
        {user ? (
          <a href="#/" onClick={(e) => { e.preventDefault(); signOut(); navigate("/"); }}>
            Sign out ({user.name})
          </a>
        ) : (
          <>
  <NavLink to="/login">Sign in</NavLink>
  <NavLink to="/signup">Sign up</NavLink>
</>
        )}
      </nav>
    </header>
  );
}