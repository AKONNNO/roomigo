import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Listings from "./pages/Listings.jsx";
import HostelDetail from "./pages/HostelDetail.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Admin from "./pages/Admin.jsx";
import { useApp } from "./context/AppContext.jsx";

// Role-based access: redirects to /login if the wrong (or no) role is signed in
function Protected({ role, children }) {
  const { user } = useApp();
  if (!user || user.role !== role) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/hostel/:id" element={<HostelDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Protected role="student"><Dashboard /></Protected>} />
          <Route path="/admin" element={<Protected role="admin"><Admin /></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <p className="note">
        Roomigo | KNUST BIT 293. All hostel data, prices and availability are sample evaluation data
        pending verification by hostel managers.
      </p>
    </>
  );
}
