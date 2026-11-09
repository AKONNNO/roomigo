import { createContext, useContext, useEffect, useState } from "react";
import { HOSTELS } from "../data/hostels.js";

const AppContext = createContext(null);
const KEY = "roomigo-v2";

// Demo values only. Real security needs a backend (Firebase) because anyone can read this file in the browser.
export const ADMIN_PASSCODE = "roomigo-admin";
export const managerCodeOf = (h) => h.managerCode || `MGR${h.id}`;

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}

// Passwords are stored as a hash, never as plain text
async function hashPassword(email, password) {
  const data = new TextEncoder().encode(`${email}:${password}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function AppProvider({ children }) {
  const saved = load();
  const [user, setUser] = useState(saved.user || null);
  const [users, setUsers] = useState(saved.users || []);
  const [enquiries, setEnquiries] = useState(saved.enquiries || []);
  const [hostels, setHostels] = useState(saved.hostels || HOSTELS);
  const [banner, setBanner] = useState(saved.banner || null);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ user, users, enquiries, hostels, banner }));
      setSaveError(false);
    } catch {
      setSaveError(true);
    }
  }, [user, users, enquiries, hostels, banner]);

  const signUp = async (name, email, password) => {
    const mail = email.trim().toLowerCase();
    if (!name.trim()) return { ok: false, error: "Please enter your name." };
    if (!/^\S+@\S+\.\S+$/.test(mail)) return { ok: false, error: "Please enter a valid email address." };
    if (password.length < 6) return { ok: false, error: "Password must be at least 6 characters." };
    if (users.some((u) => u.email === mail)) return { ok: false, error: "An account with this email already exists. Please sign in." };
    const passwordHash = await hashPassword(mail, password);
    setUsers((list) => [...list, { name: name.trim(), email: mail, passwordHash }]);
    setUser({ name: name.trim(), email: mail, role: "student" });
    return { ok: true };
  };

  const signInStudent = async (email, password) => {
    const mail = email.trim().toLowerCase();
    const found = users.find((u) => u.email === mail);
    const passwordHash = await hashPassword(mail, password);
    if (!found || found.passwordHash !== passwordHash) return { ok: false, error: "Wrong email or password." };
    setUser({ name: found.name, email: found.email, role: "student" });
    return { ok: true };
  };

  const addEnquiry = (hostelId, room, message) =>
    setEnquiries((list) => [
      ...list,
      { id: Date.now(), hostelId, user: user.name, email: user.email, room, message, status: "Pending" },
    ]);
  const setStatus = (id, status) =>
    setEnquiries((list) => list.map((e) => (e.id === id ? { ...e, status } : e)));

  const updateHostel = (id, patch) =>
    setHostels((list) => list.map((h) => (h.id === id ? { ...h, ...patch } : h)));
  const addHostel = (data) =>
    setHostels((list) => [...list, { ...data, id: Math.max(0, ...list.map((h) => h.id)) + 1 }]);
  const deleteHostel = (id) => setHostels((list) => list.filter((h) => h.id !== id));
  const addPhotos = (id, urls) =>
    setHostels((list) => list.map((h) => (h.id === id ? { ...h, photos: [...(h.photos || []), ...urls] } : h)));
  const removePhoto = (id, index) =>
    setHostels((list) =>
      list.map((h) => (h.id === id ? { ...h, photos: h.photos.filter((_, i) => i !== index) } : h))
    );

  const addRoomPhotos = (id, type, urls) =>
    setHostels((list) =>
      list.map((h) =>
        h.id === id
          ? { ...h, roomPhotos: { ...(h.roomPhotos || {}), [type]: [...(h.roomPhotos?.[type] || []), ...urls] } }
          : h
      )
    );
  const removeRoomPhoto = (id, type, index) =>
    setHostels((list) =>
      list.map((h) =>
        h.id === id
          ? { ...h, roomPhotos: { ...(h.roomPhotos || {}), [type]: (h.roomPhotos?.[type] || []).filter((_, i) => i !== index) } }
          : h
      )
    );

  const resetData = () => {
    setHostels(HOSTELS);
    setBanner(null);
  };

  const value = {
    user, users, hostels, enquiries, banner, saveError,
    signUp, signInStudent,
    signIn: (u) => setUser(u), // used for manager and admin sign-in
    signOut: () => setUser(null),
    addEnquiry, setStatus, updateHostel, addHostel, deleteHostel,
    addPhotos, removePhoto, addRoomPhotos, removeRoomPhoto, setBanner, resetData,
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);