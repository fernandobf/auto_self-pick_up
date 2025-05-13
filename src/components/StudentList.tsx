import { useState, useEffect } from "react";

function StudentList() {
  const [alunos, setAlunos] = useState<any[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const storedAlunos = localStorage.getItem("alunos");
    if (storedAlunos) {
      setAlunos(JSON.parse(storedAlunos));
    }
  }, []);

  const generateStudentId = (aluno: any, index: number) => {
    return aluno.id || `${aluno.student_name}-${aluno.student_class}-${index}`;
  };

  const handleSelectAll = () => {
    const selectableStudents = alunos.filter((aluno) => {
      const log = getLogForStudent(aluno);
      return !isLocked(log);
    });
    if (selectedStudents.size === selectableStudents.length) {
      setSelectedStudents(new Set());
    } else {
      const allIds = new Set(
        selectableStudents.map((aluno, index) => generateStudentId(aluno, index))
      );
      setSelectedStudents(allIds);
    }
  };

  const handleSelectIndividual = (aluno: any, index: number) => {
    const newSelectedStudents = new Set(selectedStudents);
    const studentId = generateStudentId(aluno, index);
    if (newSelectedStudents.has(studentId)) {
      newSelectedStudents.delete(studentId);
    } else {
      newSelectedStudents.add(studentId);
    }
    setSelectedStudents(newSelectedStudents);
  };

  const fetchLogs = async () => {
    try {
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbzXbl0HQ9NfsskL3fxz_-QUeBAyxeh85GblPpPN6aObkqjmu_gadjzb2yJS22CUDTYL/exec?act=class"
      );
      const data = await response.json();
      if (Array.isArray(data)) {
        setLogs(data);
      } else {
        console.warn("Resposta inesperada:", data);
      }
    } catch (error) {
      console.error("Erro ao buscar logs:", error);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const getLogForStudent = (aluno: any) => {
    return logs.find(
      (log) =>
        log.log_student_name === aluno.student_name &&
        log.log_student_class === aluno.student_class
    );
  };

  const isLocked = (log: any) => {
    if (!log || !log.log_timestamp) return false;
    const logTime = new Date(log.log_timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - logTime.getTime();
    const diffInMinutes = diffInMs / 1000 / 60;
    return (log.log_status === "Iniciado" || log.log_status === "Em processamento") && diffInMinutes < 60;
  };

  const handleCheckout = async () => {


    if (selectedStudents.size === 0) return;

    const studentsToLog = alunos.filter((aluno, index) =>
      selectedStudents.has(generateStudentId(aluno, index))
    );

    const url =
      "https://cors-anywhere.herokuapp.com/https://script.google.com/macros/s/AKfycbzXbl0HQ9NfsskL3fxz_-QUeBAyxeh85GblPpPN6aObkqjmu_gadjzb2yJS22CUDTYL/exec?act=start_process";

    try {
      await Promise.all(
        studentsToLog.map(async (aluno) => {
          const response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              studentName: aluno.student_name,
              tutorName: aluno.student_tutor_name,
              studentClass: aluno.student_class,
            }),
          });

          if (!response.ok) {
            throw new Error(`Erro ao registrar aluno: ${aluno.student_name}`);
          }
        })
      );

      alert("Checkout solicitado com sucesso!");
    } catch (error) {
      console.error("Erro ao registrar checkout:", error);
      alert("Houve um erro ao processar o checkout.");
    }
  };

  const isAllSelected =
    selectedStudents.size ===
    alunos.filter((aluno) => !isLocked(getLogForStudent(aluno))).length;

const allStudentsLocked = alunos.length > 0 && alunos.every((aluno) => isLocked(getLogForStudent(aluno)));


  return (
    <div style={{ padding: "2rem", color: "#333" }}>
      <div>
        {alunos[0] && alunos[0].student_tutor_name ? (
          <p>
            Olá, <b>{alunos[0].student_tutor_name}</b>.
          </p>
        ) : null}
      </div>

      <h3>Lista de Alunos</h3>

      {alunos.length > 1 && (
        <button
          onClick={handleSelectAll}
          style={{
            padding: "0.5rem",
            marginBottom: "1rem",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
          }}
        >
          {isAllSelected ? "Desmarcar Todos" : "Marcar Todos"}
        </button>
      )}

      {alunos.length > 0 ? (
        alunos.map((aluno, index) => {
          const studentId = generateStudentId(aluno, index);
          const log = getLogForStudent(aluno);
          const status = log?.log_status || "Não iniciado";
          const locked = isLocked(log);
const isCompleted = status === "Concluído";
const disabled = locked || isCompleted;

          return (
<div
  key={studentId}
  style={{
    color: "#333",
    marginBottom: "1rem",
    width: "294px",
    padding: "1rem",
    border: "1px solid #ccc",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
  }}
  onClick={() => !disabled && handleSelectIndividual(aluno, index)}
>
  <input
    type="checkbox"
    checked={selectedStudents.has(studentId)}
    disabled={disabled}
    onChange={(e) => e.stopPropagation()}
  />

              <p>
                <strong>Nome: </strong>
                {aluno.student_name}
              </p>
              <p>
                <strong>Turma: </strong>
                {aluno.student_class}
              </p>
              <p>
                <strong>Status: </strong>
                <span
                  style={{
                    color:  status === "Em processamento"
                        ? "#fff"
                        : status === "Iniciado"
                        ? "#fff"
                        : status === "Concluído"
                        ? "#fff"
                        : "inherit",
                    backgroundColor:
                      status === "Em processamento"
                        ? "green"
                        : status === "Iniciado"
                        ? "#836d0c"
                        : status === "Concluído"
                        ? "red"
                        : "inherit",
                  }}
                >
                  &nbsp;{status}&nbsp;
                </span>
              </p>
              {locked && (
                <p style={{ fontSize: "0.9rem", color: "#666" }}>
                  Aguardando 60 min para novo checkout.
                </p>
              )}
            </div>
          );
        })
      ) : (
        <p>Nenhum aluno encontrado.</p>
      )}

      <button
        onClick={handleCheckout}
        disabled={selectedStudents.size === 0 || allStudentsLocked}
        style={{
          padding: "0.5rem",
          marginTop: "1rem",
          width: "100%",
          backgroundColor: selectedStudents.size > 0 && !allStudentsLocked ? "#007BFF" : "#ccc",
          color: "white",
          border: "none",
          cursor: selectedStudents.size > 0 && !allStudentsLocked ? "pointer" : "not-allowed",
        }}
      >
        Solicitar Checkout
      </button>
    </div>
  );
}

export default StudentList;
