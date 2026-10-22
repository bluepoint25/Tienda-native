import axios from "axios";
import { apiConfig } from "./config";

export function getErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    if (!err.response) return `No se pudo conectar con el API (${apiConfig.baseURL})`;
    const data = err.response.data as { message?: string } | undefined;
    return `${err.response.status}: ${data?.message || err.message}`;
  }
  return err instanceof Error ? err.message : fallback;
}

// Crear instancia de axios
const api = axios.create({
  baseURL: apiConfig.baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar token Bearer
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Tipos de datos
export interface Product {
  id?: string;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  categoria: string;
}

// API de productos
export const productAPI = {
  // Obtener todos los productos
  getAll: () => api.get<Product[]>("/api/v1/productos"),

  // Obtener un producto por ID
  getById: (id: string) => api.get<Product>(`/api/v1/productos/${id}`),

  // Crear nuevo producto
  create: (product: Product) => api.post<Product>("/api/v1/productos", product),

  // Actualizar producto
  update: (id: string, product: Partial<Product>) =>
    api.put<Product>(`/api/v1/productos/${id}`, product),

  // Eliminar producto
  delete: (id: string) => api.delete(`/api/v1/productos/${id}`),

  // Actualizar stock
  updateStock: (id: string, quantity: number) =>
    api.patch<Product>(`/api/v1/productos/${id}/stock?quantity=${quantity}`),
};

export type TipoEvento = "PROCESADO" | "ALERTA" | "REINTENTO" | "DLQ";

export interface RegistroEvento {
  fecha: string;
  tipo: TipoEvento;
  evento: string;
  producto: string;
  detalle: string;
}

export interface EventosResponse {
  totales: Record<TipoEvento, number>;
  registros: RegistroEvento[];
}

export interface EstadoCola {
  nombre: string;
  mensajes: number;
  consumidores: number;
}

export interface EstadoListener {
  id: string;
  activo: boolean;
}

export const eventAPI = {
  getAll: () => api.get<EventosResponse>("/api/v1/eventos"),
  getColas: () => api.get<EstadoCola[]>("/api/v1/admin/rabbit/colas"),
  getListeners: () => api.get<EstadoListener[]>("/api/v1/admin/rabbit/listeners"),
  controlarListener: (id: string, accion: "iniciar" | "detener") =>
    api.post<EstadoListener>(`/api/v1/admin/rabbit/listeners/${id}/${accion}`),
  purgarCola: (nombre: string) => api.post(`/api/v1/admin/rabbit/colas/${nombre}/purgar`),
};

export default api;
