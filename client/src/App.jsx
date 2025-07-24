import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import AdminPanel from "./pages/AdminPanel";
import { useEffect } from "react";
import { getToken } from "./utils/auth";
import FileList from "./components/FileList";
function App() {
  const isAuth = !!getToken();
// index.js yoki App.jsx ichida
useEffect(() => {
  const theme = localStorage.getItem("theme");
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}, []);

  return (
    <div className="h-screen overflow-hidden w-full mx-auto   dark:bg-gray-800 flex flex-col">
  
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<VerifyEmail />} />
        <Route path="/dashboard" element={isAuth ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/profile" element={isAuth ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/admin" element={isAuth ? <AdminPanel /> : <Navigate to="/login" />} />
        
        <Route path="/fileList" element={isAuth ? <FileList /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </div>
  );
}

export default App;
