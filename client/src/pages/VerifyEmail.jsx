import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { verifyEmail } from "../utils/api";
import { saveToken } from "../utils/auth";

function VerifyEmail() {
  const [code, setCode] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const userId = location.state?.userId;

  const handleVerify = async () => {
    if (!userId) {
      alert("Foydalanuvchi ID yo‘q – iltimos ro‘yxatdan o‘ting");
      return;
    }

    if (code.length !== 6) {
      alert("Iltimos, 6 xonali kodni to‘liq kiriting");
      return;
    }

    const res = await verifyEmail(userId, code);
    if (res.token) {
      saveToken(res.token);
      alert("Email tasdiqlandi!");
      navigate("/dashboard");
    } else {
      alert(res.message || "Kod noto‘g‘ri yoki muddati o‘tgan");
    }
  };

  return (
    <div>
      <h2>Email tasdiqlash</h2>
      <p>Iltimos, emailga yuborilgan 6 xonali tasdiqlash kodini kiriting:</p>
      <input
        type="text"
        value={code}
        maxLength={6}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Masalan: 123456"
      /><br/><br/>
      <button onClick={handleVerify}>Tasdiqlash</button>
    </div>
  );
}

export default VerifyEmail;
