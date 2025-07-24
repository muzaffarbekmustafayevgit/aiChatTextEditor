import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getToken, clearToken } from "../utils/auth";
import Mode from "../components/Mode";

function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editUserId, setEditUserId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    userType: "user"
  });

  const navigate = useNavigate();
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    setIsAuth(!!getToken());
    fetchUsers();
  }, []);

  const handleLogout = () => {
    clearToken();
    navigate("/login");
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:3000/api/admin/users", {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });
      if (!res.ok) throw new Error("Foydalanuvchilarni olishda xatolik");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editUserId ? "PUT" : "POST";
      const url = editUserId
        ? `http://localhost:3000/api/admin/user/${editUserId}`
        : "http://localhost:3000/api/admin/users";

      const payload = { ...formData };
      if (!payload.password) delete payload.password;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Saqlashda xatolik yuz berdi");
      fetchUsers();
      setShowModal(false);
      resetForm();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Rostan ham o‘chirmoqchimisiz?")) return;
    try {
      const res = await fetch(`http://localhost:3000/api/admin/user/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });
      if (!res.ok) throw new Error("O‘chirishda xatolik");
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setEditUserId(null);
    setFormData({ name: "", email: "", password: "", userType: "user" });
  };

  const handleEdit = (user) => {
    setEditUserId(user._id);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      userType: user.userType || "user"
    });
    setShowModal(true);
  };

  if (loading) return <div className="text-center pt-10">⏳ Yuklanmoqda...</div>;
  if (error) return <div className="text-center text-red-500 pt-10">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 overflow-hidden">
      <nav className="flex items-center justify-between px-6 py-2 bg-white dark:bg-gray-800 shadow-md text-gray-800 dark:text-gray-300">
        <div className="text-xl font-bold">
          <Link to="/">👑 Admin Panel</Link>
        </div>
        <div className="flex items-center gap-6">
          {isAuth ? (
            <>
              <Mode />
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
              >
                Chiqish
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-blue-500 transition">Kirish</Link>
              <Link to="/register" className="hover:text-blue-500 transition">Ro‘yxatdan o‘tish</Link>
              <Mode />
            </>
          )}
        </div>
      </nav>

      <div className="max-w-5xl mx-auto">
        <div className="flex justify-end m-4">
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded shadow"
          >
            ➕ {editUserId ? "Tahrirlash" : "Yangi foydalanuvchi"}
          </button>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-lg shadow-lg relative">
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-600 text-xl"
              >
                &times;
              </button>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                {editUserId ? "✏️ Foydalanuvchini tahrirlash" : "🧑‍💼 Yangi foydalanuvchi qo‘shish"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input name="name" value={formData.name} onChange={handleInputChange} placeholder="Ism" required className="w-full p-3 border rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
                <input name="email" value={formData.email} onChange={handleInputChange} placeholder="Email" required type="email" className="w-full p-3 border rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
                <input name="password" value={formData.password} onChange={handleInputChange} placeholder="Parol" type="password" className="w-full p-3 border rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
                <select name="userType" value={formData.userType} onChange={handleInputChange} className="w-full p-3 border rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white">
                  <option value="user">👤 User</option>
                  <option value="admin">👑 Admin</option>
                </select>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="bg-gray-500 text-white px-4 py-2 rounded">Bekor</button>
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded">{editUserId ? "Saqlash" : "Qo‘shish"}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 p-6 overflow-y-auto max-h-[500px] scrollbar-hide rounded-xl shadow">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">📋 Foydalanuvchilar ro‘yxati</h2>
          {users.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-300">⚠️ Foydalanuvchilar topilmadi</p>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div key={user._id} className="flex justify-between items-center bg-blue-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white">
                      {user.name} <span className={`ml-2 text-xs px-2 py-1 rounded-full font-medium ${user.userType === "admin" ? "bg-purple-200 text-purple-800" : "bg-gray-200 text-gray-800"}`}>{user.userType}</span>
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{user.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(user)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded">✏️</button>
                    <button onClick={() => handleDeleteUser(user._id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded">🗑</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
