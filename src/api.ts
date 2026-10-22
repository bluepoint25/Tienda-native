import axios, { type AxiosInstance } from "axios";
import { apiConfig } from "./config";

export function getErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    if (!err.response) return `No se pudo conectar con ${err.config?.baseURL ?? "el API"}`;
    // ms-productos responde { message }, ms-mensajeria { mensaje, errores }
    const data = err.response.data as
      | { message?: string; mensaje?: string; errores?: Record<string, string> }
      | undefined;
    const detalle = data?.errores ? " · " + Object.values(data.errores).join(" · ") : "";
    return `${err.response.status}: ${data?.mensaje || data?.message || err.message}${detalle}`;
  }
  return err instanceof Error ? err.message : fallback;
}

function crearCliente(baseURL: string): AxiosInstance {
  const cliente = axios.create({ baseURL, headers: { "Content-Type": "application/json" } });
  cliente.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
  return cliente;
}

// ms-productos (CRUD) y ms-mensajeria (eventos y administración de RabbitMQ)
const api = crearCliente(apiConfig.baseURL);
const mensajeria = crearCliente(apiConfig.mensajeriaURL);

export interface Product {
  id?: string;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  categoria: string;
}

export const productAPI = {
  getAll: () => api.get<Product[]>("/api/v1/productos"),
  getById: (id: string) => api.get<Product>(`/api/v1/productos/${id}`),
  create: (product: Product) => api.post<Product>("/api/v1/productos", product),
  update: (id: string, product: Partial<Product>) => api.put<Product>(`/api/v1/productos/${id}`, product),
  delete: (id: string) => api.delete(`/api/v1/productos/${id}`),
  updateStock: (id: string, quantity: number) =>
    api.patch<Product>(`/api/v1/productos/${id}/stock?quantity=${quantity}`),
};

export type TipoEvento = "PROCESADO" | "ALERTA" | "NOTIFICACION" | "REINTENTO" | "DLQ";

export interface RegistroEvento {
  fecha: string;
  tipo: TipoEvento;
  cola: string;
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
  delSistema: boolean;
}

export interface EstadoListener {
  id: string;
  activo: boolean;
}

export interface QueueRequest {
  nombre: string;
  tipo: "CLASSIC" | "QUORUM";
  durable: boolean;
  conDlq: boolean;
}

export interface ExchangeRequest {
  nombre: string;
  tipo: "DIRECT" | "TOPIC" | "FANOUT";
  durable: boolean;
}

export interface BindingRequest {
  cola: string;
  exchange: string;
  routingKey: string;
}

export const eventAPI = {
  getAll: () => mensajeria.get<EventosResponse>("/api/v1/eventos"),
  getColas: () => mensajeria.get<EstadoCola[]>("/api/v1/admin/queues"),
  getListeners: () => mensajeria.get<EstadoListener[]>("/api/v1/admin/listeners"),
  controlarListener: (id: string, accion: "start" | "stop") =>
    mensajeria.post<EstadoListener>(`/api/v1/admin/listeners/${id}/${accion}`),
  purgarCola: (nombre: string) => mensajeria.post(`/api/v1/admin/queues/${nombre}/purge`),
};

export const rabbitAdminAPI = {
  crearCola: (req: QueueRequest) => mensajeria.post<EstadoCola>("/api/v1/admin/queues", req),
  eliminarCola: (nombre: string) => mensajeria.delete(`/api/v1/admin/queues/${encodeURIComponent(nombre)}`),
  crearExchange: (req: ExchangeRequest) => mensajeria.post("/api/v1/admin/exchanges", req),
  eliminarExchange: (nombre: string) => mensajeria.delete(`/api/v1/admin/exchanges/${encodeURIComponent(nombre)}`),
  crearBinding: (req: BindingRequest) => mensajeria.post("/api/v1/admin/bindings", req),
  eliminarBinding: (req: BindingRequest) => mensajeria.delete("/api/v1/admin/bindings", { data: req }),
};

export default api;
