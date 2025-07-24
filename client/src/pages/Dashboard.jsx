import React, { useState, useEffect } from "react";
import FileList from "../components/FileList";
import Editor from "../components/Editor";
import { getToken } from "../utils/auth";
import ChatBox from "../components/ChatBox";
import Navbar from "../components/Navbar";
function Dashboard() {
  const [files, setFiles] = useState([]);
  const [editingFile, setEditingFile] = useState(null);

  // Fayllarni yuklash
  const loadFiles = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/editor/files", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setFiles(data);
    } catch (err) {
      console.error("Fayllarni yuklashda xatolik:", err);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  // ✅ Fayl yaratildi yoki yangilandi
  const handleSave = async (file) => {
    if (file._id) {
      // yangilangan faylni almashtirish
      setFiles((prev) =>
        prev.map((f) => (f._id === file._id ? file : f))
      );
    } else {
      // yangi fayl yaratish
      try {
        const res = await fetch("http://localhost:3000/api/editor/save", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify(file),
        });

        const newFile = await res.json();
        if (res.ok) {
          setFiles((prev) => [newFile, ...prev]);
          alert("✅ Yangi fayl yaratildi");
        } else {
          alert("❌ Yaratishda xatolik");
        }
      } catch (err) {
        console.error("Server xatoligi:", err);
        alert("❌ Server bilan bog‘lanishda xatolik");
      }
    }

    setEditingFile(null);
  };

  // Faylni o‘chirish
  const handleDelete = (fileId) => {
    setFiles((prev) => prev.filter((f) => f._id !== fileId));
  };

  // Faylni tahrirlash
  const handleEdit = (file) => {
    setEditingFile(file);
    window.scrollTo({ top: 0, behavior: "smooth" }); // editorga skroll
  };

  return (
    <div className="w-full h-screen dark:bg-gray-800 bg-gray-50 text-gray-800 dark:text-gray-300 flex flex-col">
    {/* Header */}
    <Navbar/>
    <div className="flex justify-around py-2 bg-white dark:bg-gray-900 shadow-md">
      <h1 className="text-xl font-bold">🗂 File List</h1>
      <h1 className="text-xl font-bold">📝 Matn Tahrirlovchi</h1>
      <h1 className="text-xl font-bold">🤖 AI Chat</h1>
    </div>
  
    {/* Asosiy tarkib */}
    <div className="flex flex-1 overflow-hidden">
      {/* Fayl list */}
      <div className="w-[25%] bg-gray-100 dark:bg-gray-800 p-4 overflow-y-auto">
        <FileList
          files={files}
          onDownload={() => {}}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreate={() => setEditingFile(null)}
        />
      </div>
  
      {/* Matn tahrirlovchi */}
      <div className="w-[50%] bg-white dark:bg-gray-800 p-4 overflow-y-auto">
        <Editor onSave={handleSave} editingFile={editingFile} />
      </div>
  
      {/* Chat qismi */}
      <div className="w-[25%] bg-gray-100 dark:bg-gray-800 p-4 overflow-y-auto">
        <ChatBox />
      </div>
    </div>
  </div>
  

  );
}

export default Dashboard;
