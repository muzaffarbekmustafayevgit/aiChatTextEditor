import { useState } from "react";
import { registerUser } from "../utils/api";
import { useNavigate } from "react-router-dom";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("user");
  const [gender, setGender] = useState("male"); // default: male
  const navigate = useNavigate();

  const handleRegister = async () => {
    const data = await registerUser({
      name,
      email,
      password,
      userType,
      gender,
    });

    if (data.userId) {
      alert("Tasdiqlash kodi emailga yuborildi");
      navigate("/verify", { state: { userId: data.userId } });
    } else {
      alert(data.message || "Ro‘yxatdan o‘tishda xatolik");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-200 dark:from-gray-800 dark:to-gray-900">
    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg w-full max-w-sm">
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-700 dark:text-white">
        Ro‘yxatdan o‘tish
      </h2>
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Ismingiz"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        <input
          type="password"
          placeholder="Parol"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
  
        {/* Gender tanlash */}
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="">Jinsni tanlang</option>
          <option value="male">Erkak</option>
          <option value="female">Ayol</option>
        </select>
  
        <button
          onClick={handleRegister}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-200"
        >
          Ro‘yxatdan o‘tish
        </button>
      </div>
      <p className="text-sm text-gray-500 text-center mt-4 dark:text-gray-400">
        Allaqachon hisobingiz bormi? <a href="/login" className="text-blue-600 hover:underline">Kirish</a>
      </p>
    </div>
  </div>
  
  );
}

export default Register;
