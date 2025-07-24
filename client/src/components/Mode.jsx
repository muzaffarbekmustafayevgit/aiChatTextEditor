import { useEffect, useState } from "react";

export default function Mode() {
  const [darkMode, setDarkMode] = useState(false);

  // Component yuklanganda localStorage'dan holatni o‘qish
  useEffect(() => {
    const storedMode = localStorage.getItem("theme");
    const isDark = storedMode === "dark";

    setDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  // Tugma bosilganda
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);

    document.documentElement.classList.toggle("dark", newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
  };

  return (
    <div className="flex flex-col items-center justify-center  bg-white dark:bg-gray-900 text-black dark:text-white">
      <button
        onClick={toggleDarkMode}
        className="px-3 py-1 rounded-md bg-gray-800 text-white hover:bg-gray-700 dark:bg-yellow-400 dark:text-black transition"
      >
        {darkMode ? "🌞 " : "🌙 "}
      </button>
    </div>
  );
}
