import { createContext, useContext, useEffect, useState } from "react";
import { HOSTELS } from "../data/hostels.js";

const AppContext = createContext(null);
const KEY = "roomigo";

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}

export function AppProvider({ children }) {
  const saved = load();
  const [user, setUser] = useState(saved.user || null);
  const [enquiries, setEnquiries] = useState(saved.enquiries || []);
  // only the admin's availability edits are saved, so changes to hostels.js always show up
  const [availability, setAvailability] = useState(saved.availability || {});

  const hostels = HOSTELS.map((h) => ({ ...h, available: availability[h.id] ?? h.available }));

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ user, enquiries, availability }));
    } catch { /* storage unavailable */ }
  }, [user, enquiries, availability]);

  const addEnquiry = (hostelId, room, message) =>
    setEnquiries((list) => [
      ...list,
      { id: Date.now(), hostelId, user: user.name, room, message, status: "Pending" },
    ]);

  const setStatus = (id, status) =>
    setEnquiries((list) => list.map((e) => (e.id === id ? { ...e, status } : e)));

  const setAvailable = (id, n) =>
    setAvailability((a) => ({ ...a, [id]: Math.max(0, n) }));

  const value = {
    user, hostels, enquiries,
    signIn: (name, role) => setUser({ name: name || "Guest", role }),
    signOut: () => setUser(null),
    addEnquiry, setStatus, setAvailable,
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);