import { useEffect, useState } from "react";
import { authService } from "../services/authService";
import { useNavigate } from "react-router-dom";

function OAuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Procesar el código de autorización
        const user = await authService.processCallback();

        if (user && user.isSignedIn) {
          // Limpiar la URL y redirigir al home
          window.history.replaceState({}, document.title, window.location.pathname);
          navigate("/");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Error al procesar login";
        setError(errorMessage);
        console.error("OAuth callback error:", err);
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="login-container">
        <div className="login-box">
          <h1>❌ Error en el login</h1>
          <p>{error}</p>
          <button onClick={() => window.location.href = "/"} className="login-button">
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>⏳ Procesando login...</h1>
        <p>Por favor espera mientras se completa la autenticación.</p>
      </div>
    </div>
  );
}

export default OAuthCallback;
