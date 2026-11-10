import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = () => {
  return supabaseUrl && 
         supabaseAnonKey && 
         !supabaseUrl.includes("placeholder") &&
         !supabaseUrl.includes("your-project-id");
};

// Auth functions
export async function signUpStudent(name, email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name, role: "student" } },
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true, data };
}

export async function signInStudent(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: "Wrong email or password." };
  
  const { data: profile } = await supabase
    .from("profiles").select("*").eq("id", data.user.id).single();
  
  return { ok: true, user: profile ? { name: profile.name, email: profile.email, role: profile.role } : null };
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function getCurrentUser() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  
  const { data: profile } = await supabase
    .from("profiles").select("*").eq("id", session.user.id).single();
  
  return profile || null;
}

// Hostels
export async function fetchHostels() {
  const { data, error } = await supabase
    .from("hostels").select("*").order("id");
  if (error) return [];

  // Fallback photo paths for each hostel
  const fallbackPhotos = [
    "images/akwaaba-court-1.jpg",
    "images/oak-ridge-lodge-1.jpg",
    "images/unity-heights-1.jpg",
    "images/sunrise-suites-1.jpg",
    "images/green-valley-hostel-1.jpg",
    "images/cedar-point-1.jpg",
  ];

  return data.map((h, i) => ({
    id: h.id, name: h.name, area: h.area, price: h.price,
    dist: parseFloat(h.dist), rooms: h.rooms || [], amenities: h.amenities || [],
    available: h.available, description: h.description || "",
    photos: h.photos?.length ? h.photos : [fallbackPhotos[i] || fallbackPhotos[0]],
    roomPhotos: h.room_photos || {},
    featured: h.featured || false,
    managerCode: h.manager_code || null,
  }));
}

export async function updateHostel(id, patch) {
  // Convert camelCase field names to snake_case for Supabase
  const dbPatch = { ...patch };
  if ("managerCode" in dbPatch) {
    dbPatch.manager_code = dbPatch.managerCode;
    delete dbPatch.managerCode;
  }
  const { error } = await supabase.from("hostels").update(dbPatch).eq("id", id);
  return { ok: !error };
}

export async function addHostel(data) {
  // Convert camelCase to snake_case
  const dbData = { ...data };
  if ("managerCode" in dbData) {
    dbData.manager_code = dbData.managerCode;
    delete dbData.managerCode;
  }
  const { data: hostel, error } = await supabase
    .from("hostels").insert([dbData]).select().single();
  return { ok: !error, hostel };
}

export async function deleteHostel(id) {
  const { error } = await supabase.from("hostels").delete().eq("id", id);
  return { ok: !error };
}

// Enquiries
export async function fetchEnquiries(userEmail) {
  const { data } = await supabase
    .from("enquiries").select("*").eq("user_email", userEmail).order("created_at", { ascending: false });
  return (data || []).map(e => ({
    id: e.id, hostelId: e.hostel_id, user: e.user_name,
    email: e.user_email, room: e.room, message: e.message, status: e.status,
  }));
}

export async function fetchAllEnquiries(hostelId = null) {
  let query = supabase.from("enquiries").select("*").order("created_at", { ascending: false });
  if (hostelId) query = query.eq("hostel_id", hostelId);
  const { data } = await query;
  return (data || []).map(e => ({
    id: e.id, hostelId: e.hostel_id, user: e.user_name,
    email: e.user_email, room: e.room, message: e.message, status: e.status,
  }));
}

export async function createEnquiry(hostelId, room, message, user) {
  const { error } = await supabase.from("enquiries").insert([{
    hostel_id: hostelId, room, message,
    user_name: user.name, user_email: user.email,
  }]);
  return { ok: !error };
}

export async function updateEnquiryStatus(id, status) {
  const { error } = await supabase.from("enquiries").update({ status }).eq("id", id);
  return { ok: !error };
}

// Banner
export async function fetchBanner() {
  const { data } = await supabase.from("banners").select("image_url").eq("active", true).limit(1).single();
  return data?.image_url || null;
}

export async function setBanner(imageUrl) {
  await supabase.from("banners").update({ active: false }).eq("active", true);
  await supabase.from("banners").insert([{ image_url: imageUrl, active: true }]);
}

export async function removeBanner() {
  await supabase.from("banners").update({ active: false }).eq("active", true);
}

// Image upload to Supabase Storage
export async function uploadImage(file) {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from("images")
      .upload(fileName, file, { cacheControl: "3600", upsert: false });
    
    if (error) {
      console.error("Supabase upload error:", error);
      return null;
    }
    
    const { data: urlData } = supabase.storage
      .from("images")
      .getPublicUrl(data.path);
    
    return urlData.publicUrl;
  } catch (err) {
    console.error("Upload failed:", err);
    return null;
  }
}
