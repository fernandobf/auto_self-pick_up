import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const BACKEND_URL =
  "https://script.google.com/macros/s/AKfycbzXbl0HQ9NfsskL3fxz_-QUeBAyxeh85GblPpPN6aObkqjmu_gadjzb2yJS22CUDTYL/exec";

function Login() {
  const [phone, setPhone] = useState(localStorage.getItem("savedPhone") || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Só tenta login automático se os dados já estiverem armazenados anteriormente
    const savedPhone = localStorage.getItem("savedPhone");
    const savedAlunos = localStorage.getItem("alunos");

    if (savedPhone && savedAlunos) {
      navigate("/students");
    }
  }, [navigate]);

  const validatePhone = (num: string) => {
    return /^3519\d{8}$/.test(num);
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
      console.log("Dados recebidos:", data);

      if (data.alunos?.length > 0) {
        localStorage.setItem("savedPhone", phone);
        localStorage.setItem("alunos", JSON.stringify(data.alunos));
        navigate("/students");
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
    <div className="container">
      <h2>Login por TELEFONE</h2>
      <input
        type="text"
        placeholder="Digite seu número (ex: 351910000001)"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <button onClick={handleLogin} disabled={loading}>
        {loading ? "Carregando..." : "Entrar"}
      </button>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default Login;
