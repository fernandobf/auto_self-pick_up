import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const BACKEND_URL =
  "https://script.google.com/macros/s/AKfycbzXbl0HQ9NfsskL3fxz_-QUeBAyxeh85GblPpPN6aObkqjmu_gadjzb2yJS22CUDTYL/exec";

function Login() {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedPhone = localStorage.getItem("savedPhone");
    const savedAlunos = localStorage.getItem("alunos");

    if (savedPhone && savedAlunos) {
      navigate("/students", { replace: true });
    }
  }, [navigate]);

  const validatePhone = (num: string) => {
    return /^351\d{9}$/.test(num);
  };

  const handleLogin = async () => {
    if (!validatePhone(phone)) {
      setError("Formato inválido. Use 3519XXXXXXXX");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}?act=login&phone=${phone}`);
      const data = await res.json();

      if (data.alunos?.length > 0) {
        localStorage.setItem("savedPhone", phone);
        localStorage.setItem("alunos", JSON.stringify(data.alunos));
        navigate("/students", { replace: true });
      } else {
        setError("Nenhum aluno encontrado.");
      }
    } catch (err) {
      setError("Erro ao conectar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content login">
      <div className="container">
        <h2>Login por TELEFONE</h2>
        <input
          type="number"
          placeholder="(ex: 351910000001)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <button onClick={handleLogin} disabled={loading}>
          {loading ? "Carregando..." : "Entrar"}
        </button>
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
}

export default Login;
