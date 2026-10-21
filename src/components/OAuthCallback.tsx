import { useEffect, useState } from "react";
import { authService } from "../services/authService";

function OAuthCallback() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const user = await authService.processCallback();

        if (user && user.isSignedIn) {
          window.history.replaceState({}, document.title, "/");
          window.location.href = "/";
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Error al procesar login";
        setError(errorMessage);
        setLoading(false);
        console.error("OAuth callback error:", err);
      }
    };

    handleCallback();
  }, []);

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <h1>❌ Error en el login</h1>
        <p>{error}</p>
        <button onClick={() => window.location.href = "/"}>Volver al inicio</button>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <h1>⏳ Procesando login...</h1>
        <p>Por favor espera mientras se completa la autenticación.</p>
      </div>
    );
  }

  return null;
}

export default OAuthCallback;
