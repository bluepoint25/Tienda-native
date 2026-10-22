import { useState } from "react";
import type { Product } from "../api";
import { productAPI, getErrorMessage } from "../api";
import "./ProductForm.css";

interface ProductFormProps {
  onSuccess: () => void;
}

function ProductForm({ onSuccess }: ProductFormProps) {
  const [formData, setFormData] = useState<Product>({
    nombre: "",
    descripcion: "",
    precio: 0,
    stock: 0,
    categoria: "General",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "precio" || name === "stock" ? parseFloat(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!formData.nombre || !formData.descripcion) {
      setError("Nombre y descripción son requeridos");
      return;
    }

    if (formData.precio <= 0) {
      setError("El precio debe ser mayor a 0");
      return;
    }

    if (formData.stock < 0) {
      setError("El stock no puede ser negativo");
      return;
    }

    try {
      setLoading(true);
      await productAPI.create(formData);
      setSuccess(true);
      setFormData({
        nombre: "",
        descripcion: "",
        precio: 0,
        stock: 0,
        categoria: "General",
      });
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Error al crear producto"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-form-container">
      <h2>Crear Nuevo Producto</h2>
      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-group">
          <label htmlFor="nombre">Nombre *</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleInputChange}
            placeholder="Ej: Laptop"
            minLength={3}
            maxLength={100}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="descripcion">Descripción *</label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleInputChange}
            placeholder="Ej: Laptop de 15 pulgadas con 16GB RAM"
            minLength={10}
            maxLength={500}
            rows={4}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="precio">Precio *</label>
            <input
              type="number"
              id="precio"
              name="precio"
              value={formData.precio}
              onChange={handleInputChange}
              placeholder="0.00"
              step="0.01"
              min="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="stock">Stock *</label>
            <input
              type="number"
              id="stock"
              name="stock"
              value={formData.stock}
              onChange={handleInputChange}
              placeholder="0"
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="categoria">Categoría *</label>
            <select
              id="categoria"
              name="categoria"
              value={formData.categoria}
              onChange={handleInputChange}
              required
            >
              <option value="General">General</option>
              <option value="Electrónica">Electrónica</option>
              <option value="Ropa">Ropa</option>
              <option value="Alimentos">Alimentos</option>
              <option value="Hogar">Hogar</option>
              <option value="Otros">Otros</option>
            </select>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && (
          <div className="success-message">
            ¡Producto creado exitosamente! Redirigiendo...
          </div>
        )}

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Creando..." : "Crear Producto"}
        </button>
      </form>
    </div>
  );
}

export default ProductForm;
