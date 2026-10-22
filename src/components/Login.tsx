import { authService } from "../services/authService";
import "./Login.css";

function Login() {
  const handleLogin = () => {
    authService.login();
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>🏪 Tienda Native</h1>
        <p>Sistema de gestión de productos</p>

        <div className="login-form">
          <p style={{ marginBottom: "20px", textAlign: "center" }}>
            Inicia sesión con tu cuenta de Cognito
          </p>

          <button onClick={handleLogin} className="login-button">
            Ingresar con Cognito
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
