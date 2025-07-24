import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getToken } from "../utils/auth";

function Editor({ onSave, editingFile }) {
  const [form, setForm] = useState({
    text: "",
    font: "Arial",
    color: "#000000",
    size: "12",
    bold: false,
    italic: false,
    underline: false,
    align: "left",
    lineHeight: "1.5",
    highlight: "#ffffff",
    email: "",
  });

  const [fileId, setFileId] = useState(null);

  useEffect(() => {
    if (editingFile) {
      setForm({
        text: editingFile.text || "",
        font: editingFile.font || "Arial",
        color: editingFile.color || "#000000",
        size: editingFile.size || "12",
        bold: editingFile.bold || false,
        italic: editingFile.italic || false,
        underline: editingFile.underline || false,
        align: editingFile.align || "left",
        lineHeight: editingFile.lineHeight || "1.5",
        highlight: editingFile.highlight || "#ffffff",
        email: "",
      });
      setFileId(editingFile._id);
    }
  }, [editingFile]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const clearForm = () => {
    setForm({
      text: "",
      font: "Arial",
      color: "#000000",
      size: "12",
      bold: false,
      italic: false,
      underline: false,
      align: "left",
      lineHeight: "1.5",
      highlight: "#ffffff",
      email: "",
    });
    setFileId(null);
  };

  const handleSave = async () => {
    if (!form.text.trim()) {
      alert("⚠️ Matn kiritilishi shart!");
      return; // ❌ Serverga yuborilmaydi
    }
  
    const payload = { ...form };
    try {
      if (fileId) {
        const res = await fetch(`http://localhost:3000/api/editor/file/${fileId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify(payload),
        });
  
        if (res.ok) {
          const updated = await res.json();
          alert("✅ Fayl yangilandi");
          onSave(updated);
          clearForm();
        } else {
          const error = await res.text();
          alert("❌ Xatolik: " + error);
        }
      } else {
        // ✅ faqat matn to‘ldirilgan bo‘lsa saqlanadi
        onSave(payload);
        clearForm();
      }
    } catch (err) {
      alert("❌ Serverga ulanishda xatolik: " + err.message);
    }
  };
  

  const handleSendEmail = async () => {
    if (!form.text.trim()) {
      alert("⚠️ Matn kiritilishi shart!");
      return; // ❌ Serverga yuborilmaydi
    }
  
    if (!form.email.trim()) {
      alert("⚠️ Email manzili kiritilishi kerak!");
      return; // ❌ Serverga yuborilmaydi
    }
  
    try {
      const res = await fetch("http://localhost:3000/api/editor/save-send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ ...form }),
      });
  
      const data = await res.json();
      if (data?.fileId) {
        alert("📨 Emailga yuborildi!");
      } else {
        alert("❌ Email yuborishda xatolik");
      }
    } catch (err) {
      alert("❌ Server xatosi: " + err.message);
    }
  };
  
  return (
    <motion.div
  className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-300 dark:border-gray-700 p-6 overflow-y-auto"
  initial={{ opacity: 0, y: 40 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, type: "spring" }}
>
  {/* Editor maydoni */}
  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">📝 Matn maydoni</label>
  <textarea
  placeholder="Bu yerga matn kiriting..."
  value={form.text}
  onChange={(e) => handleChange("text", e.target.value)}
  rows={20}
  className={`w-full resize-none border border-gray-300 dark:border-gray-700 rounded-xl p-6 text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md transition-all duration-300 text-lg
    ${form.bold ? "font-bold" : "font-normal"}
    ${form.italic ? "italic" : "not-italic"}
    ${form.underline ? "underline" : "no-underline"}
    hover:shadow-lg focus:shadow-lg
    dark:focus:ring-blue-600
    placeholder-gray-400 dark:placeholder-gray-500
    min-h-[300px]`}
  style={{
    fontFamily: form.font,
    fontSize: `${form.size}px`,
    textAlign: form.align,
    lineHeight: form.lineHeight,
    backgroundColor: form.highlight,
    color: form.color,
    transition: "all 0.3s ease",
  }}
/>

  {/* Sozlamalar */}
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
    <div>
      <label className="text-sm text-gray-600 dark:text-gray-300">Shrift</label>
      <select
        value={form.font}
        onChange={(e) => handleChange("font", e.target.value)}
        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 text-gray-800 dark:text-white"
      >
        <option value="Arial">Arial</option>
        <option value="Times New Roman">Times New Roman</option>
        <option value="Georgia">Georgia</option>
        <option value="Courier New">Courier New</option>
        <option value="Roboto">Roboto</option>
      </select>
    </div>

    <div>
      <label className="text-sm text-gray-600 dark:text-gray-300">O‘lcham</label>
      <select
        value={form.size}
        onChange={(e) => handleChange("size", e.target.value)}
        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 text-gray-800 dark:text-white"
      >
        {[12, 14, 16, 18, 20, 24, 28, 32, 36].map((s) => (
          <option key={s} value={s}>{s}px</option>
        ))}
      </select>
    </div>

    <div>
      <label className="text-sm text-gray-600 dark:text-gray-300">Qator balandligi</label>
      <input
        type="number"
        step="0.1"
        value={form.lineHeight}
        onChange={(e) => handleChange("lineHeight", e.target.value)}
        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 text-gray-800 dark:text-white"
      />
    </div>

    <div>
      <label className="text-sm text-gray-600 dark:text-gray-300">Matn rangi</label>
      <input type="color" value={form.color} onChange={(e) => handleChange("color", e.target.value)} className="w-full h-10" />
    </div>

    <div>
      <label className="text-sm text-gray-600 dark:text-gray-300">Fon rangi</label>
      <input type="color" value={form.highlight} onChange={(e) => handleChange("highlight", e.target.value)} className="w-full h-10" />
    </div>

    <div>
      <label className="text-sm text-gray-600 dark:text-gray-300">Tekstni tekislash</label>
      <select
        value={form.align}
        onChange={(e) => handleChange("align", e.target.value)}
        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 text-gray-800 dark:text-white"
      >
        <option value="left">Chap</option>
        <option value="center">Markaz</option>
        <option value="right">O‘ng</option>
        <option value="justify">Justify</option>
      </select>
    </div>

    <label className="flex items-center gap-2 mt-3">
      <input type="checkbox" checked={form.bold} onChange={(e) => handleChange("bold", e.target.checked)} />
      <span className="text-gray-700 dark:text-gray-300">Qalin</span>
    </label>
    <label className="flex items-center gap-2 mt-3">
      <input type="checkbox" checked={form.italic} onChange={(e) => handleChange("italic", e.target.checked)} />
      <span className="text-gray-700 dark:text-gray-300">Qiyshiq</span>
    </label>
    <label className="flex items-center gap-2 mt-3">
      <input type="checkbox" checked={form.underline} onChange={(e) => handleChange("underline", e.target.checked)} />
      <span className="text-gray-700 dark:text-gray-300">Chizilgan</span>
    </label>
  </div>

  {/* Tugmalar */}
  <div className="flex gap-4 mt-8">
    <button
      onClick={handleSave}
      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 rounded-lg hover:brightness-110 transition"
    >
      {fileId ? "📁 Yangilash" : "💾 Saqlash"}
    </button>
    {fileId && (
      <button
        onClick={clearForm}
        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg transition"
      >
        ❌ Bekor qilish
      </button>
    )}
  </div>

  {/* Email yuborish */}
  <div className="mt-6">
      <input
      type="email"
      placeholder="Email manzilingiz"
      value={form.email}
      onChange={(e) => handleChange("email", e.target.value)}
      className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white mb-3"
    />
    <button
      onClick={handleSendEmail}
      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:brightness-110 text-white px-4 py-2 rounded-lg transition"
    >
      📤 Emailga yuborish
    </button>
  </div>
</motion.div>

  

  );
}

export default Editor;
