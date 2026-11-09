import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Listings from "./pages/Listings.jsx";
import HostelDetail from "./pages/HostelDetail.jsx";
import Login from "./pages/Login.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Admin from "./pages/Admin.jsx";
import Manager from "./pages/Manager.jsx";
import { useApp } from "./context/AppContext.jsx";
import Signup from "./pages/Signup.jsx";  



// Role-based access: sends the wrong (or signed-out) visitor to the right sign-in page
function Protected({ role, to = "/login", children }) {
  const { user } = useApp();
  if (!user || user.role !== role) return <Navigate to={to} replace />;
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
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/dashboard" element={<Protected role="student"><Dashboard /></Protected>} />
          <Route path="/manager" element={<Protected role="manager"><Manager /></Protected>} />
          <Route path="/admin" element={<Protected role="admin" to="/admin-login"><Admin /></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </main>
      <p className="note">
        Roomigo | KNUST BIT 293. All hostel data, prices and availability are sample evaluation data
        pending verification by hostel managers.
      </p>
    </>
  );
}