import { useState } from "react";
import { authService } from "../services/authService";
import "./Login.css";

interface LoginProps {
  onLoginSuccess: () => void;
}

function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await authService.login(email, password);
      onLoginSuccess();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error al iniciar sesión";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>🏪 Tienda Native</h1>
        <p>Sistema de gestión de productos</p>
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@ejemplo.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Iniciando sesión..." : "Ingresar"}
          </button>
        </form>

        <div className="credentials-hint">
          <p>
            <strong>Usa credenciales de tu User Pool de Cognito</strong>
          </p>
          <p className="help-text">
            Crea un usuario en tu AWS Cognito User Pool antes de intentar acceder.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
