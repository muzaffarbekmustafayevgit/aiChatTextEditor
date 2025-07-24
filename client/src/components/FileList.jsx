import { getToken } from "../utils/auth";

function FileList({ files, onDownload, onEdit, onDelete, onCreate }) {
  const handleDownload = async (fileId) => {
    const userEmail = localStorage.getItem("email");
    try {
      const res = await fetch(`http://localhost:3000/api/export/word/${fileId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${getToken()}`, "Cache-Control": "no-cache",
        },
      });

      if (!res.ok) throw new Error("Faylni olishda xatolik: " + res.statusText);

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `text_${fileId}.docx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      if (userEmail) {
        const emailRes = await fetch("http://localhost:3000/api/export/email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
            "Cache-Control": "no-cache",
          },
          body: JSON.stringify({ fileId, email: userEmail }),
        });

        const emailData = await emailRes.json();
        
        alert(emailData.message || "Email yuborishda xatolik");
      } else {
        alert("Email topilmadi. Iltimos, login qiling.");
      }
    } catch (error) {
      console.error("Xatolik:", error);
      alert("❌ Faylni yuklash yoki email yuborishda xatolik");
    }
  };

  const handleDelete = async (fileId) => {
    const confirmDelete = window.confirm("Faylni o‘chirishga ishonchingiz komilmi?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`http://localhost:3000/api/editor/file/${fileId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Cache-Control": "no-cache",
        },
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message || "✅ Fayl o‘chirildi.");
        onDelete && onDelete(fileId);
      } else {
        alert(data.message || "❌ O‘chirishda xatolik yuz berdi.");
      }
    } catch (err) {
      console.error("O‘chirish xatoligi:", err);
      alert("❌ Server bilan ulanishda muammo.");
    }
  };

  return (
    <div className="grid gap-5 overflow-y-auto max-h-[80vh] pr-2">
    {/* Fayl yaratish tugmasi */}
    <div className="flex justify-end">
      <button
        onClick={onCreate}
        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold text-sm px-6 py-2 rounded-xl shadow transition"
      >
        🗂 Yangi fayl yaratish
      </button>
    </div>
  
    {/* Fayllar mavjud emas */}
    {files.length === 0 && (
      <p className="text-center text-gray-500 dark:text-gray-400 mt-6 text-sm">
        🚫 Hech qanday fayl topilmadi
      </p>
    )}
  
    {/* Fayllar ro'yxati */}
    {files.map((file) => (
      <div
        key={file._id}
        className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
      >
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">
            📄 Fayl: <span className="text-blue-500">{file._id.slice(-6)}</span>
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            🕒 {new Date(file.editedAt).toLocaleString()}
          </span>
        </div>
  
        {/* Amallar */}
        <div className="flex flex-wrap gap-3 mt-4">
          <button
            onClick={() => handleDownload(file._id)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-4 rounded-lg shadow-sm transition"
          >
            ⬇️Yuklab olish
          </button>
          <button
            onClick={() => onEdit(file)}
            className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black text-sm py-2 px-4 rounded-lg shadow-sm transition"
          >
            ✏️ Tahrirlash
          </button>
          <button
            onClick={() => handleDelete(file._id)}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-4 rounded-lg shadow-sm transition"
          >
            ❌ O‘chirish
          </button>
        </div>
      </div>
    ))}
  </div>
  

  );
}

export default FileList;
