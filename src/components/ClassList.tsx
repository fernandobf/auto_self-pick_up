import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";

interface CheckoutLog {
  log_id: string;
  log_student_name: string;
  log_student_tutor_name: string;
  log_student_class: string;
  log_status: string;
  log_action_type: string;
  log_timestamp: string;
}

const POLL_INTERVAL = 5000;

const LiveCheckouts = () => {
  const [searchParams] = useSearchParams();
  const currentClass = searchParams.get("name")?.toLowerCase() || "";
  const [logs, setLogs] = useState<CheckoutLog[]>([]);
  const prevLogIdsRef = useRef<Set<string>>(new Set());

  const playBeep = () => {
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, context.currentTime); // frequência em Hz
    oscillator.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.2); // som curto de 0.2s
  };

const fetchLogs = async () => {
  try {
    const response = await fetch(
      `https://script.google.com/macros/s/AKfycbzXbl0HQ9NfsskL3fxz_-QUeBAyxeh85GblPpPN6aObkqjmu_gadjzb2yJS22CUDTYL/exec?act=class&name=${currentClass}`
    );
    const data: CheckoutLog[] = await response.json();

    if (Array.isArray(data)) {
      // Ordena os logs para que os mais recentes apareçam no topo
      const sorted = data.sort(
        (a, b) =>
          new Date(b.log_timestamp).getTime() - new Date(a.log_timestamp).getTime()
      );

      // Compara com os logs anteriores para detectar novos registros
      const prevIds = prevLogIdsRef.current;

      // Filtra logs novos que não estavam presentes nos logs anteriores
      const newLogs = sorted.filter(
        (log) => !prevIds.has(log.log_id) && log.log_student_class.toLowerCase() === currentClass
      );

      if (newLogs.length > 0) {
        // Toca o beep apenas se houver novos registros para a turma
        playBeep();
      }

      // Atualiza a referência dos logs anteriores
      prevLogIdsRef.current = new Set(sorted.map((log) => log.log_id));

      // Atualiza o estado dos logs
      setLogs(sorted);
    } else {
      console.warn("Resposta não é um array:", data);
      setLogs([]);
    }
  } catch (error) {
    console.error("Erro ao buscar logs:", error);
  }
};


  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [currentClass]);

  const getRowClass = (log: CheckoutLog) => {
    // Destaca apenas a linha onde a turma é igual à turma atual
    return log.log_student_class.toLowerCase() === currentClass
      ? "bg-yellow-200"
      : "";
  };


const handleStatusUpdate = async (logId: string, newStatus: string) => {
  const act =
    newStatus === "Em processamento"
      ? "update_status_progress"
      : "update_status_finished";

  try {
    const response = await fetch(
      `https://script.google.com/macros/s/AKfycbzXbl0HQ9NfsskL3fxz_-QUeBAyxeh85GblPpPN6aObkqjmu_gadjzb2yJS22CUDTYL/exec?act=${act}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          log_id: logId,
          new_status: newStatus,
        }).toString(),
      }
    );

    const result = await response.json();

    if (result.success) {
      fetchLogs(); // Atualiza os dados imediatamente
    } else {
      console.error("Erro ao atualizar status:", result.error);
    }
  } catch (error) {
    console.error("Erro na requisição:", error);
  }
};



  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Checkouts</h2>
      {logs.length === 0 ? (
        <p className="text-gray-500">Nenhum checkout registrado.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-2 py-1">Nome</th>
              <th className="border px-2 py-1">Responsável</th>
              <th className="border px-2 py-1">Turma</th>
              <th className="border px-2 py-1">Data/Hora</th>
              <th className="border px-2 py-1">Ações</th>
            </tr>
          </thead>
          <tbody>
            {logs
              .filter((log) => log.log_status !== "Concluído") // 👈 filtro aplicado
              .map((log) => (
                <tr key={log.log_id} className={getRowClass(log)}>
                <td className="border px-2 py-1">{log.log_student_name}</td>
                <td className="border px-2 py-1">
                  {log.log_student_tutor_name}
                </td>
                <td className="border px-2 py-1">{log.log_student_class}</td>
                <td className="border px-2 py-1">{log.log_timestamp}</td>
                <td className="border px-2 py-1">
                  

{log.log_student_class.toLowerCase() === currentClass && (
  <>
    {log.log_status === "Iniciado" && (
      <button
        className="bg-blue-500 text-white px-2 py-1 rounded"
        onClick={() => handleStatusUpdate(log.log_id, "Em processamento")}
      >
        Aceitar solicitação
      </button>
    )}

    {log.log_status === "Em processamento" && (
      <button
        className="bg-green-600 text-white px-2 py-1 rounded"
        onClick={() => handleStatusUpdate(log.log_id, "Concluído")}
      >
        Concluir
      </button>
    )}
  </>
)}



                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default LiveCheckouts;
