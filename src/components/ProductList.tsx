import { useState, useEffect } from "react";
import type { Product } from "../api";
import { productAPI } from "../api";
import "./ProductList.css";

function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productAPI.getAll();
      setProducts(response.data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error al cargar productos";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    if (!confirm("¿Estás seguro de que deseas eliminar este producto?")) return;

    try {
      await productAPI.delete(id);
      setProducts(products.filter((p) => p.id !== id));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error al eliminar producto";
      setError(errorMessage);
    }
  };

  if (loading) {
    return <div className="loading">Cargando productos...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <p>Error: {error}</p>
        <button onClick={loadProducts}>Reintentar</button>
      </div>
    );
  }

  return (
    <div className="product-list-container">
      <h2>Catálogo de Productos</h2>
      {products.length === 0 ? (
        <p className="empty-state">No hay productos disponibles</p>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-header">
                <h3>{product.nombre}</h3>
                <span className="category">{product.categoria}</span>
              </div>
              <p className="description">{product.descripcion}</p>
              <div className="product-footer">
                <div className="price-stock">
                  <div>
                    <span className="label">Precio:</span>
                    <span className="value">${product.precio}</span>
                  </div>
                  <div>
                    <span className="label">Stock:</span>
                    <span className={`value ${product.stock === 0 ? "out-of-stock" : ""}`}>
                      {product.stock}
                    </span>
                  </div>
                </div>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(product.id)}
                  title="Eliminar producto"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductList;
