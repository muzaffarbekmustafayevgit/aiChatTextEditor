import { Link, useNavigate } from "react-router-dom";
import { getToken, clearToken } from "../utils/auth";
import { useEffect, useState } from "react";
import Mode from "./Mode";

function Navbar() {
  const navigate = useNavigate();
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    setIsAuth(!!getToken());
  }, []);

  const handleLogout = () => {
    clearToken();
    navigate("/login");
  };

  return (
    <nav className="flex items-center justify-between px-6 py-2 bg-white dark:bg-gray-800 dark:shadow-white dark:shadow-md shadow-md text-gray-800 dark:text-gray-300">
      {/* Chapdagi logotip */}
      <div className="text-xl font-bold">
        <Link to="/">🧠 AI Editor</Link>
      </div>

      {/* O‘ngdagi menyu */}
      <div className="flex items-center gap-6">
        {isAuth ? (
          <>
            <Link to="/dashboard" className="hover:text-blue-500 transition">Dashboard</Link>
            <Link to="/profile" className="hover:text-blue-500 transition">Profil</Link>
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
  );
}

export default Navbar;
