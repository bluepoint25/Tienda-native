import { useEffect, useRef, useState } from "react";
import { authService } from "../services/authService";

function OAuthCallback() {
  const [error, setError] = useState<string | null>(null);
  // StrictMode ejecuta el efecto dos veces en dev; el code de Cognito es de un solo uso
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const params = new URLSearchParams(window.location.search);
    if (params.has("error")) {
      setError(params.get("error_description") || params.get("error"));
      return;
    }

    authService
      .processCallback()
      .then(() => window.location.replace("/"))
      .catch((err) => {
        console.error("OAuth callback error:", err);
        setError(err instanceof Error ? err.message : "Error al procesar login");
      });
  }, []);

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <h1>❌ Error en el login</h1>
        <p>{error}</p>
        <button onClick={() => window.location.replace("/")}>Volver al inicio</button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h1>⏳ Procesando login...</h1>
      <p>Por favor espera mientras se completa la autenticación.</p>
    </div>
  );
}

export default OAuthCallback;
