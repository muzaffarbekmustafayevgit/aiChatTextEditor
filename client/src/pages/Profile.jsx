import { useEffect, useState } from "react";
import { getToken } from "../utils/auth";
import Navbar from "../components/Navbar";

function EditProfileModal({ isOpen, onClose, onSave, profile }) {
  const [form, setForm] = useState({
    name: profile.name || "",
    password: ""
  });

  useEffect(() => {
    setForm({
      name: profile.name || "",
      password: ""
    });
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSave(form);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
     
      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4 dark:text-white">Profilni tahrirlash</h2>
        
        {/* Profile Picture Display (read-only) */}
        <div className="flex justify-center mb-4">
          <img
            src={profile.profilePic || "/default-avatar.png"}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-gray-700"
          />
        </div>
        
        <div className="space-y-3">
          <input
            name="name"
            type="text"
            placeholder="Ism"
            value={form.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
          />
          <input
            name="password"
            type="password"
            placeholder="Yangi parol (bo'sh qoldiring o'zgartirmasdan)"
            value={form.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
          />
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Bekor qilish
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Saqlash
          </button>
        </div>
      </div>
    </div>
  );
}

function Profile() {
  const [profile, setProfile] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/auth/me", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error("Profil ma'lumotlarini olishda xatolik");
      const data = await res.json();
      setProfile(data);
    } catch (error) {
      console.error("Profile fetch error:", error);
      alert(error.message);
    }
  };

  const handleSaveProfile = async (form) => {
    try {
      const res = await fetch("http://localhost:3000/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          name: form.name,
          password: form.password || undefined
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Profilni yangilashda xatolik");
      }

      const updated = await res.json();
      setProfile(updated);
      setIsEditing(false);
      alert("Profil muvaffaqiyatli yangilandi!");
    } catch (error) {
      console.error("Profile update error:", error);
      alert(error.message);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <div className="min-h-screen h-screen bg-gradient-to-br from-sky-100 to-blue-200 dark:from-gray-800 dark:to-gray-950 transition-colors duration-500">
    <Navbar />
    
    <div className="max-w-4xl mt-20 mx-auto bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-2xl ring-1 ring-gray-200 dark:ring-gray-700 text-gray-800 dark:text-gray-200">
      
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
        <img
          src={profile.profilePic || "/default-avatar.png"}
          alt="Profile"
          className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-lg hover:scale-105 transition-transform duration-300"
        />
        
        <div className="text-center sm:text-left">
          <h2 className="text-3xl font-bold tracking-tight">{profile.name}</h2>
          <p className="text-md mt-1">{profile.email}</p>
          <p className="text-sm mt-1 text-gray-500 dark:text-gray-400">
            🗓 Ro'yxatdan o'tgan: {new Date(profile.createdAt).toLocaleDateString("uz-UZ")}
          </p>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <button
          onClick={() => setIsEditing(true)}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full font-medium transition-all shadow-md hover:shadow-lg"
        >
          ✏️ Profilni tahrirlash
        </button>
      </div>
    </div>
  
    {/* Modal */}
    <EditProfileModal
      isOpen={isEditing}
      onClose={() => setIsEditing(false)}
      onSave={handleSaveProfile}
      profile={profile}
    />
  </div>
  

  );
}

export default Profile;