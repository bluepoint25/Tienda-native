import { useState, useEffect } from "react";
import "./App.css";
import Login from "./components/Login";
import OAuthCallback from "./components/OAuthCallback";
import ProductList from "./components/ProductList";
import ProductForm from "./components/ProductForm";
import { authService } from "./services/authService";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    authService.isAuthenticated()
  );
  const [activeTab, setActiveTab] = useState<"list" | "create">("list");
  const [username, setUsername] = useState(
    authService.getCurrentUser()?.username || ""
  );
  const [isCallback, setIsCallback] = useState(false);

  useEffect(() => {
    // Verificar si estamos procesando un callback de OAuth
    const params = new URLSearchParams(window.location.search);
    if (params.has("code")) {
      setIsCallback(true);
    }
  }, []);

  const handleLogout = () => {
    authService.logout();
    setIsLoggedIn(false);
    setUsername("");
    setActiveTab("list");
  };

  // Procesar callback de OAuth
  if (isCallback) {
    return <OAuthCallback />;
  }

  // Si no está logueado, mostrar login
  if (!isLoggedIn) {
    return <Login />;
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <h1>🏪 Tienda Native</h1>
          <nav className="tabs">
            <button
              className={`tab ${activeTab === "list" ? "active" : ""}`}
              onClick={() => setActiveTab("list")}
            >
              📋 Productos
            </button>
            <button
              className={`tab ${activeTab === "create" ? "active" : ""}`}
              onClick={() => setActiveTab("create")}
            >
              ➕ Nuevo Producto
            </button>
          </nav>
          <div className="user-section">
            <span className="username">👤 {username}</span>
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        {activeTab === "list" && <ProductList />}
        {activeTab === "create" && <ProductForm onSuccess={() => setActiveTab("list")} />}
      </main>

      <footer className="app-footer">
        <p>Tienda Native © 2024 | API Gateway + Cognito + DynamoDB</p>
      </footer>
    </div>
  );
}

export default App;
