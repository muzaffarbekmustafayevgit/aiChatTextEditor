const API = "http://localhost:3000/api";

export const loginUser = async (email, password) => {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Login xatosi");
  return data;
};
export const registerUser = async (userData) => {
  const res = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Ro'yxatdan o'tishda xatolik");
  return data;
};

export const verifyEmail = async (userId, code) => {
  const res = await fetch(`${API}/auth/verify-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, code }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Tasdiqlash kodi noto‘g‘ri");
  return data;
};
