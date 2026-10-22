import { useCallback, useEffect, useState } from "react";
import type { EstadoCola, EstadoListener, EventosResponse, TipoEvento } from "../api";
import { eventAPI, getErrorMessage } from "../api";
import RabbitAdminForm from "./RabbitAdminForm";
import "./EventPanel.css";

const INTERVALO_MS = 3000;

const ETIQUETAS: Record<TipoEvento, string> = {
  PROCESADO: "✓ Auditado",
  ALERTA: "⚠ Alerta stock",
  NOTIFICACION: "✉ Notificación",
  REINTENTO: "↻ Reintento",
  DLQ: "✗ En DLQ",
};

function EventPanel() {
  const [data, setData] = useState<EventosResponse | null>(null);
  const [colas, setColas] = useState<EstadoCola[]>([]);
  const [listeners, setListeners] = useState<EstadoListener[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [accionError, setAccionError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      const [ev, cs, ls] = await Promise.all([eventAPI.getAll(), eventAPI.getColas(), eventAPI.getListeners()]);
      setData(ev.data);
      setColas(cs.data);
      setListeners(ls.data);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err, "Error al cargar eventos"));
    }
  }, []);

  useEffect(() => {
    cargar();
    const id = setInterval(cargar, INTERVALO_MS);
    return () => clearInterval(id);
  }, [cargar]);

  const ejecutar = async (accion: () => Promise<unknown>) => {
    try {
      setAccionError(null);
      await accion();
      await cargar();
    } catch (err) {
      setAccionError(getErrorMessage(err, "No se pudo ejecutar la acción"));
    }
  };

  return (
    <div className="event-panel">
      <h2>🔔 Eventos de RabbitMQ</h2>
      <p className="event-hint">
        Datos de <strong>ms-mensajeria</strong>, se actualizan cada 3 s. Crea un producto con stock menor a 5 para ver
        alerta + notificación, con <strong>FALLA</strong> en el nombre para ver los reintentos, o con
        <strong> INVALIDO</strong> para ver un error permanente que va directo a la DLQ.
      </p>

      {error && <div className="event-error">{error}</div>}
      {accionError && <div className="event-error">{accionError}</div>}

      {colas.length > 0 && (
        <div className="event-section">
          <h3>Colas y consumidores</h3>
          <table className="event-table">
            <thead>
              <tr>
                <th>Cola</th>
                <th>Mensajes en espera</th>
                <th>Consumidores</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {colas.map((c) => (
                <tr key={c.nombre}>
                  <td>{c.nombre}</td>
                  <td className={c.mensajes > 0 ? "event-pendientes" : ""}>{c.mensajes}</td>
                  <td>{c.consumidores}</td>
                  <td>
                    <button className="event-btn" onClick={() => ejecutar(() => eventAPI.purgarCola(c.nombre))}>
                      Purgar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="event-listeners">
            {listeners.map((l) => (
              <div key={l.id} className={`event-listener ${l.activo ? "activo" : "detenido"}`}>
                <span>
                  {l.activo ? "🟢" : "🔴"} <strong>{l.id}</strong>
                </span>
                <button
                  className="event-btn"
                  onClick={() => ejecutar(() => eventAPI.controlarListener(l.id, l.activo ? "stop" : "start"))}
                >
                  {l.activo ? "Detener" : "Iniciar"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {!error && <RabbitAdminForm onCambio={cargar} />}

      {data && (
        <>
          <div className="event-stats">
            {(Object.keys(ETIQUETAS) as TipoEvento[]).map((tipo) => (
              <div key={tipo} className={`event-stat tipo-${tipo}`}>
                <div className="event-stat-number">{data.totales[tipo] ?? 0}</div>
                <div className="event-stat-label">{ETIQUETAS[tipo]}</div>
              </div>
            ))}
          </div>

          {data.registros.length === 0 ? (
            <p className="event-empty">Aún no hay eventos. Crea, edita o elimina un producto.</p>
          ) : (
            <ul className="event-list">
              {data.registros.map((r, i) => (
                <li key={`${r.fecha}-${i}`} className={`event-item tipo-${r.tipo}`}>
                  <span className="event-badge">{ETIQUETAS[r.tipo]}</span>
                  <span className="event-main">
                    <strong>{r.producto}</strong> · {r.cola}
                    <small>{r.detalle}</small>
                  </span>
                  <span className="event-time">{new Date(r.fecha).toLocaleTimeString()}</span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

export default EventPanel;
