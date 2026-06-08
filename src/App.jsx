import React, { useState, useEffect, useContext, useReducer, createContext } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import axios from 'axios';
import './App.css';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState({
    nombre: 'Ana Gómez',
    rol: 'Administrador',
    autenticado: true,
  });

  return (
    <AuthContext.Provider value={{ usuario, setUsuario }}>
      {children}
    </AuthContext.Provider>
  );
}

async function solicitarPrestamo(idEquipo, idUsuario) {
  try {
    const respuesta = await axios.post('https://api.techborrow.local/v1/reservas', {
      equipoId: idEquipo,
      usuarioId: idUsuario,
      fechaReserva: new Date(),
    });
    console.log('Reserva confirmada:', respuesta.data);
  } catch (error) {
    console.error('Error al procesar la reserva (Simulado):', error.message);
    alert('Simulación de petición Axios (POST) ejecutada correctamente.');
  }
}

export function TarjetaEquipo({ id, nombre, tipo, estado }) {
  const disponible = estado === 'Disponible';
  return (
    <article className="equipment-card">
      <div className="equipment-card__head">
        <h3 className="equipment-card__name">{nombre}</h3>
        <span className={`badge ${disponible ? 'badge--available' : 'badge--busy'}`}>
          {estado}
        </span>
      </div>
      <p className="equipment-card__category">{tipo}</p>
      {disponible && (
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => solicitarPrestamo(id, 1)}
        >
          Solicitar préstamo
        </button>
      )}
    </article>
  );
}

function Inicio() {
  const [equipos, setEquipos] = useState([]);

  useEffect(() => {
    const cargarDatos = async () => {
      const listaEquipos = [
        { id: 101, nombre: 'Laptop HP ProBook', tipo: 'Computador', estado: 'Disponible' },
        { id: 102, nombre: "Monitor Samsung 24''", tipo: 'Periférico', estado: 'Ocupado' },
        { id: 103, nombre: 'Teclado Mecánico Keychron', tipo: 'Periférico', estado: 'Disponible' },
      ];
      setEquipos(listaEquipos);
    };
    cargarDatos();
  }, []);

  return (
    <section>
      <div className="page-title">
        <h2>Catálogo de equipos</h2>
        <p>{equipos.length} equipos en inventario</p>
      </div>
      <div className="equipment-grid">
        {equipos.map((eq) => (
          <TarjetaEquipo key={eq.id} id={eq.id} nombre={eq.nombre} tipo={eq.tipo} estado={eq.estado} />
        ))}
      </div>
    </section>
  );
}

const reservaReducer = (estado, accion) => {
  switch (accion.type) {
    case 'AGREGAR_EQUIPO':
      return {
        ...estado,
        equiposSeleccionados: [...estado.equiposSeleccionados, accion.payload],
      };
    default:
      return estado;
  }
};

export function PanelReservas() {
  const [cargando, setCargando] = useState(true);
  const { usuario } = useContext(AuthContext);
  const [estadoReserva, dispatch] = useReducer(reservaReducer, { equiposSeleccionados: [] });

  useEffect(() => {
    const t = setTimeout(() => setCargando(false), 1200);
    return () => clearTimeout(t);
  }, []);

  const agregarAlCarrito = (equipo) => {
    dispatch({ type: 'AGREGAR_EQUIPO', payload: equipo });
  };

  if (cargando) {
    return (
      <section className="panel">
        <span className="loading">Cargando panel para {usuario.nombre}...</span>
      </section>
    );
  }

  return (
    <section className="panel">
      <div className="page-title">
        <h2>Mis reservas activas</h2>
        <p>Sesión: {usuario.nombre} · {usuario.rol}</p>
      </div>
      <button type="button" className="btn btn--ghost" onClick={() => agregarAlCarrito('Laptop HP ProBook')}>
        Reservar Laptop
      </button>
      <p className="panel__meta" style={{ marginTop: '1rem' }}>
        Equipos en proceso: {estadoReserva.equiposSeleccionados.length}
      </p>
      {estadoReserva.equiposSeleccionados.length === 0 ? (
        <p className="empty-state">Aún no has añadido equipos.</p>
      ) : (
        <ul className="reservation-list">
          {estadoReserva.equiposSeleccionados.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function AppNavegacion() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-shell">
          <header className="app-header">
            <div className="app-brand">
              <span className="app-brand-dot" aria-hidden="true" />
              TechBorrow
            </div>
            <nav className="app-nav">
              <NavLink to="/" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} end>
                Catálogo
              </NavLink>
              <NavLink to="/mis-reservas" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                Mis reservas
              </NavLink>
            </nav>
          </header>

          <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/mis-reservas" element={<PanelReservas />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
