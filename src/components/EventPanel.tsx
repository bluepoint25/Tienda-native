import { useEffect, useState } from "react";
import type { EventosResponse, TipoEvento } from "../api";
import { eventAPI, getErrorMessage } from "../api";
import "./EventPanel.css";

const INTERVALO_MS = 3000;

const ETIQUETAS: Record<TipoEvento, string> = {
  PROCESADO: "✓ Procesado",
  ALERTA: "⚠ Alerta stock",
  REINTENTO: "↻ Reintento",
  DLQ: "✗ En DLQ",
};

function EventPanel() {
  const [data, setData] = useState<EventosResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargar = () =>
      eventAPI
        .getAll()
        .then((r) => {
          setData(r.data);
          setError(null);
        })
        .catch((err) => setError(getErrorMessage(err, "Error al cargar eventos")));

    cargar();
    const id = setInterval(cargar, INTERVALO_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="event-panel">
      <h2>🔔 Eventos de RabbitMQ</h2>
      <p className="event-hint">
        Se actualiza cada 3 s. Crea un producto con stock menor a 5 para ver una alerta, o con la palabra
        <strong> FALLA </strong> en el nombre para ver los reintentos y la DLQ.
      </p>

      {error && (
        <div className="event-error">
          {error}
          <br />
          <small>El panel funciona con el backend local (RabbitMQ no está desplegado en AWS).</small>
        </div>
      )}

      {data && (
        <>
          <div className="event-stats">
            {(Object.keys(ETIQUETAS) as TipoEvento[]).map((tipo) => (
              <div key={tipo} className={`event-stat tipo-${tipo}`}>
                <div className="event-stat-number">{data.totales[tipo]}</div>
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
                    <strong>{r.producto}</strong> · {r.evento}
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
