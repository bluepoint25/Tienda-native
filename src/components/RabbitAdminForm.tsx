import { useState } from "react";
import type { ExchangeRequest, QueueRequest } from "../api";
import { getErrorMessage, rabbitAdminAPI } from "../api";

interface Props {
  onCambio: () => void;
}

// Formulario del administrador de RabbitMQ (ms-mensajeria): crear / eliminar colas, exchanges y bindings
function RabbitAdminForm({ onCambio }: Props) {
  const [cola, setCola] = useState<QueueRequest>({ nombre: "", tipo: "QUORUM", durable: true, conDlq: true });
  const [exchange, setExchange] = useState<ExchangeRequest>({ nombre: "", tipo: "TOPIC", durable: true });
  const [binding, setBinding] = useState({ cola: "", exchange: "", routingKey: "" });
  const [resultado, setResultado] = useState<{ ok: boolean; texto: string } | null>(null);

  const ejecutar = async (accion: () => Promise<unknown>, exito: string) => {
    try {
      await accion();
      setResultado({ ok: true, texto: exito });
      onCambio();
    } catch (err) {
      setResultado({ ok: false, texto: getErrorMessage(err, "No se pudo ejecutar la operación") });
    }
  };

  return (
    <div className="event-section">
      <h3>Administrar RabbitMQ</h3>
      {resultado && <div className={resultado.ok ? "admin-ok" : "event-error"}>{resultado.texto}</div>}

      <div className="admin-grid">
        <fieldset>
          <legend>Cola</legend>
          <input placeholder="pagos.queue" value={cola.nombre} onChange={(e) => setCola({ ...cola, nombre: e.target.value })} />
          <select value={cola.tipo} onChange={(e) => setCola({ ...cola, tipo: e.target.value as QueueRequest["tipo"] })}>
            <option value="QUORUM">QUORUM</option>
            <option value="CLASSIC">CLASSIC</option>
          </select>
          <label>
            <input type="checkbox" checked={cola.durable} onChange={(e) => setCola({ ...cola, durable: e.target.checked })} /> durable
          </label>
          <label>
            <input type="checkbox" checked={cola.conDlq} onChange={(e) => setCola({ ...cola, conDlq: e.target.checked })} /> con DLQ
          </label>
          <div className="admin-actions">
            <button className="event-btn" onClick={() => ejecutar(() => rabbitAdminAPI.crearCola(cola), `Cola '${cola.nombre}' creada`)}>
              Crear
            </button>
            <button className="event-btn danger" onClick={() => ejecutar(() => rabbitAdminAPI.eliminarCola(cola.nombre), `Cola '${cola.nombre}' eliminada`)}>
              Eliminar
            </button>
          </div>
        </fieldset>

        <fieldset>
          <legend>Exchange</legend>
          <input placeholder="pagos.exchange" value={exchange.nombre} onChange={(e) => setExchange({ ...exchange, nombre: e.target.value })} />
          <select value={exchange.tipo} onChange={(e) => setExchange({ ...exchange, tipo: e.target.value as ExchangeRequest["tipo"] })}>
            <option value="TOPIC">TOPIC</option>
            <option value="DIRECT">DIRECT</option>
            <option value="FANOUT">FANOUT</option>
          </select>
          <div className="admin-actions">
            <button className="event-btn" onClick={() => ejecutar(() => rabbitAdminAPI.crearExchange(exchange), `Exchange '${exchange.nombre}' creado`)}>
              Crear
            </button>
            <button className="event-btn danger" onClick={() => ejecutar(() => rabbitAdminAPI.eliminarExchange(exchange.nombre), `Exchange '${exchange.nombre}' eliminado`)}>
              Eliminar
            </button>
          </div>
        </fieldset>

        <fieldset>
          <legend>Binding</legend>
          <input placeholder="cola" value={binding.cola} onChange={(e) => setBinding({ ...binding, cola: e.target.value })} />
          <input placeholder="exchange" value={binding.exchange} onChange={(e) => setBinding({ ...binding, exchange: e.target.value })} />
          <input placeholder="routing key (pago.#)" value={binding.routingKey} onChange={(e) => setBinding({ ...binding, routingKey: e.target.value })} />
          <div className="admin-actions">
            <button className="event-btn" onClick={() => ejecutar(() => rabbitAdminAPI.crearBinding(binding), "Binding creado")}>
              Crear
            </button>
            <button className="event-btn danger" onClick={() => ejecutar(() => rabbitAdminAPI.eliminarBinding(binding), "Binding eliminado")}>
              Eliminar
            </button>
          </div>
        </fieldset>
      </div>
    </div>
  );
}

export default RabbitAdminForm;
