import { useState } from "react";
import { loginUser } from "../utils/api";
import { saveToken } from "../utils/auth";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();


  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
  
    try {
      const data = await loginUser(email, password);
      if (data.token) {
        saveToken(data.token);
        localStorage.setItem("role", data.userType); // TO‘G‘RI: backendda userType deb kelyapti
  
        if (data.userType === "admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      } else {
        alert(data.message || "Login muvaffaqiyatsiz");
      }
    } catch (error) {
      alert(error.message || "Xatolik yuz berdi. Keyinroq urinib ko‘ring.");
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 dark:from-gray-800 dark:to-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-700 dark:text-white">
          Kirish Sahifasi
        </h2>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.email ? "border-red-500 focus:ring-red-400" : "focus:ring-blue-400 border-gray-300"
              } dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
            )}
          </div>
          
          <div>
            <input
              type="password"
              placeholder="Parol"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.password ? "border-red-500 focus:ring-red-400" : "focus:ring-blue-400 border-gray-300"
              } dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-200 flex items-center justify-center ${
              isLoading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Kuting...
              </>
            ) : (
              "Kirish"
            )}
          </button>
        </form>
        
        <p className="text-sm text-gray-500 text-center mt-4 dark:text-gray-400">
          Hisobingiz yo'qmi?{" "}
          <a href="/register" className="text-blue-600 hover:underline dark:text-blue-400">
            Ro'yxatdan o'ting
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;