import { createContext, useContext, useEffect, useState } from "react";
import { HOSTELS } from "../data/hostels.js";
import * as supabaseService from "../lib/supabase-service.js";

const AppContext = createContext(null);
const KEY = "roomigo-v2";
const useSupabase = supabaseService.isSupabaseConfigured();

// Demo values only. Real security needs a backend (Firebase) because anyone can read this file in the browser.
export const ADMIN_PASSCODE = "roomigo-admin";

// Get manager code — uses saved code from hostel data, or generates default MGR{id}
export const managerCodeOf = (h) => h.managerCode || `MGR${h.id}`;

function load() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY)) || {};
    // Ensure hostels always have photos (merge saved data with defaults if needed)
    if (data.hostels && data.hostels.length) {
      data.hostels = data.hostels.map((h, i) => ({
        ...h,
        photos: h.photos?.length ? h.photos : (HOSTELS[i]?.photos || []),
      }));
    }
    return data;
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
  const [banner, setBannerState] = useState(saved.banner || null);
  const [saveError, setSaveError] = useState(false);
  const [loading, setLoading] = useState(useSupabase);

  // Load initial data from Supabase
  useEffect(() => {
    if (useSupabase) {
      Promise.all([
        supabaseService.fetchHostels(),
        supabaseService.fetchBanner(),
      ]).then(([hostelsData, bannerData]) => {
        if (hostelsData.length) setHostels(hostelsData);
        if (bannerData) setBannerState(bannerData);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, []);

  // Save to localStorage as fallback
  useEffect(() => {
    if (!useSupabase) {
      try {
        localStorage.setItem(KEY, JSON.stringify({ user, users, enquiries, hostels, banner }));
        setSaveError(false);
      } catch {
        setSaveError(true);
      }
    }
  }, [user, users, enquiries, hostels, banner]);

  const signUp = async (name, email, password) => {
    if (useSupabase) {
      const result = await supabaseService.signUpStudent(name, email, password);
      if (result.ok) setUser({ name, email, role: "student" });
      return result;
    }
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
    if (useSupabase) {
      const result = await supabaseService.signInStudent(email, password);
      if (result.ok) setUser(result.user);
      return result;
    }
    const mail = email.trim().toLowerCase();
    const found = users.find((u) => u.email === mail);
    const passwordHash = await hashPassword(mail, password);
    if (!found || found.passwordHash !== passwordHash) return { ok: false, error: "Wrong email or password." };
    setUser({ name: found.name, email: found.email, role: "student" });
    return { ok: true };
  };

  const addEnquiry = async (hostelId, room, message) => {
    if (useSupabase && user) await supabaseService.createEnquiry(hostelId, room, message, user);
    setEnquiries((list) => [
      ...list,
      { id: Date.now(), hostelId, user: user.name, email: user.email, room, message, status: "Pending" },
    ]);
  };

  const setStatus = async (id, status) => {
    if (useSupabase) await supabaseService.updateEnquiryStatus(id, status);
    setEnquiries((list) => list.map((e) => (e.id === id ? { ...e, status } : e)));
  };

  const updateHostel = async (id, patch) => {
    if (useSupabase) await supabaseService.updateHostel(id, patch);
    setHostels((list) => list.map((h) => (h.id === id ? { ...h, ...patch } : h)));
  };

  const addHostel = async (data) => {
    // Generate a client-side ID immediately so the UI updates instantly
    const tempId = Date.now();
    const newHostel = {
      ...data,
      id: tempId,
      photos: data.photos || [],
      roomPhotos: data.roomPhotos || {},
      featured: data.featured || false,
    };

    // Optimistic update — show immediately
    setHostels((list) => [...list, newHostel]);

    if (useSupabase) {
      const result = await supabaseService.addHostel(data);
      if (result.ok && result.hostel) {
        // Replace temp entry with real one from DB
        setHostels((list) =>
          list.map((h) => (h.id === tempId ? { ...h, ...result.hostel, id: result.hostel.id || tempId } : h))
        );
      } else if (!result.ok) {
        // Supabase failed — keep the local entry but don't remove it
        console.warn("Supabase addHostel failed, keeping local entry.");
      }
      return result;
    }

    return { ok: true };
  };

  const deleteHostel = async (id) => {
    if (useSupabase) await supabaseService.deleteHostel(id);
    setHostels((list) => list.filter((h) => h.id !== id));
  };

  const addPhotos = async (id, urls) => {
    const updated = hostels.map((h) => h.id === id ? { ...h, photos: [...(h.photos || []), ...urls] } : h);
    setHostels(updated);
    if (useSupabase) await supabaseService.updateHostel(id, { photos: updated.find(h => h.id === id)?.photos });
  };

  const removePhoto = async (id, index) => {
    const updated = hostels.map((h) => h.id === id ? { ...h, photos: h.photos.filter((_, i) => i !== index) } : h);
    setHostels(updated);
    if (useSupabase) await supabaseService.updateHostel(id, { photos: updated.find(h => h.id === id)?.photos });
  };

  const addRoomPhotos = async (id, type, urls) => {
    const updated = hostels.map((h) =>
      h.id === id ? { ...h, roomPhotos: { ...(h.roomPhotos || {}), [type]: [...(h.roomPhotos?.[type] || []), ...urls] } } : h
    );
    setHostels(updated);
    if (useSupabase) await supabaseService.updateHostel(id, { room_photos: updated.find(h => h.id === id)?.roomPhotos });
  };

  const removeRoomPhoto = async (id, type, index) => {
    const updated = hostels.map((h) =>
      h.id === id ? { ...h, roomPhotos: { ...(h.roomPhotos || {}), [type]: (h.roomPhotos?.[type] || []).filter((_, i) => i !== index) } } : h
    );
    setHostels(updated);
    if (useSupabase) await supabaseService.updateHostel(id, { room_photos: updated.find(h => h.id === id)?.roomPhotos });
  };

  const setBanner = async (url) => {
    setBannerState(url);
    if (useSupabase) url ? await supabaseService.setBanner(url) : await supabaseService.removeBanner();
  };

  const resetData = () => {
    setHostels(HOSTELS);
    setBannerState(null);
  };

  const signIn = (u) => setUser(u);
  const signOut = async () => {
    if (useSupabase) await supabaseService.signOut();
    setUser(null);
  };

  const value = {
    user, users, hostels, enquiries, banner, saveError, loading,
    signUp, signInStudent, signIn, signOut,
    addEnquiry, setStatus, updateHostel, addHostel, deleteHostel,
    addPhotos, removePhoto, addRoomPhotos, removeRoomPhoto, setBanner, resetData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);