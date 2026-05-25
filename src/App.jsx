import React, { useState, useEffect, useContext, useReducer, createContext } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';

// --- 1. CONTEXT API (Exacto a la pág. 8 del PDF) ---
export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState({
    nombre: "Ana Gómez",
    rol: "Administrador",
    autenticado: true
  });

  return (
    <AuthContext.Provider value={{ usuario, setUsuario }}>
      {children}
    </AuthContext.Provider>
  );
}

// --- 2. PETICIONES HTTP CON AXIOS (Exacto a la pág. 9 del PDF) ---
async function solicitarPrestamo(idEquipo, idUsuario) {
  try {
    // Al ser una URL de prueba, capturamos el error para que la app no colapse
    console.log("Intentando Axios POST a https://api.techborrow.local/v1/reservas");
    const respuesta = await axios.post('https://api.techborrow.local/v1/reservas', {
      equipoId: idEquipo,
      usuarioId: idUsuario,
      fechaReserva: new Date()
    });
    console.log("Reserva confirmada:", respuesta.data);
  } catch (error) {
    console.error("Error al procesar la reserva (Simulado):", error.message);
    alert("Simulación de petición Axios (POST) ejecutada. Revisa la consola.");
  }
}

// --- 3. COMPONENTE REACTJS (Exacto a la pág. 4 del PDF) ---
export function TarjetaEquipo({ nombre, tipo, estado }) {
  return (
    <div className="tarjeta-dispositivo" style={{ border: '1px solid #444', padding: '15px', margin: '10px 0', borderRadius: '8px' }}>
      <h3 style={{ margin: '0 0 10px 0' }}>{nombre}</h3>
      <p style={{ margin: '5px 0' }}>Categoría: {tipo}</p>
      
      <span className={estado === 'Disponible' ? 'badge-verde' : 'badge-rojo'} 
            style={{ color: estado === 'Disponible' ? '#4ade80' : '#f87171', fontWeight: 'bold' }}>
        {estado}
      </span>
      <br />
      {estado === 'Disponible' && (
        <button className="btn-solicitar" 
                onClick={() => solicitarPrestamo(Math.random(), 1)}
                style={{ marginTop: '15px', padding: '8px 12px', cursor: 'pointer' }}>
          Solicitar Préstamo (Axios)
        </button>
      )}
    </div>
  );
}

// --- 4. COMPONENTE INICIO (Basado en el REST GET de la pág. 3) ---
function Inicio() {
  const [equipos, setEquipos] = useState([]);

  useEffect(() => {
    // Simulamos la función asíncrona obtenerEquiposDisponibles()
    const cargarDatos = async () => {
      const listaEquipos = [
        { id: 101, nombre: "Laptop HP ProBook", tipo: "Computador", estado: "Disponible" },
        { id: 102, nombre: "Monitor Samsung 24''", tipo: "Periférico", estado: "Ocupado" },
        { id: 103, nombre: "Teclado Mecánico Keychron", tipo: "Periférico", estado: "Disponible" }
      ];
      setEquipos(listaEquipos);
    };
    cargarDatos();
  }, []);

  return (
    <div>
      <h2>Catálogo de Equipos</h2>
      {equipos.map(eq => (
        <TarjetaEquipo key={eq.id} nombre={eq.nombre} tipo={eq.tipo} estado={eq.estado} />
      ))}
    </div>
  );
}

// --- 5. PANEL DE RESERVAS HOOKS (Exacto a la pág. 6 y 7 del PDF) ---
const reservaReducer = (estado, accion) => {
  switch (accion.type) {
    case 'AGREGAR_EQUIPO':
      return {
        ...estado,
        equiposSeleccionados: [...estado.equiposSeleccionados, accion.payload]
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
    setTimeout(() => {
      setCargando(false);
    }, 1500);
  }, []);

  const agregarAlCarrito = (equipo) => {
    dispatch({ type: 'AGREGAR_EQUIPO', payload: equipo });
  };

  if (cargando) {
    return <p>Cargando panel para {usuario.nombre}...</p>;
  }

  return (
    <div>
      <h2>Mis Reservas Activas</h2>
      <button onClick={() => agregarAlCarrito('Laptop HP ProBook')} style={{ padding: '8px', cursor: 'pointer' }}>
        Reservar Laptop (useReducer)
      </button>
      <p>Equipos en proceso: {estadoReserva.equiposSeleccionados.length}</p>
      <ul>
        {estadoReserva.equiposSeleccionados.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

// --- 6. RUTAS Y NAVEGACIÓN (Exacto a la pág. 10 del PDF) ---
// Usamos "export default" para que Vite lo reconozca como el componente raíz
export default function AppNavegacion() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div style={{ fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto', color: '#fff' }}>
          <header style={{ background: '#1e293b', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
            <nav style={{ display: 'flex', gap: '20px' }}>
              <Link to="/" style={{ color: '#61dafb', textDecoration: 'none', fontWeight: 'bold' }}>Catálogo de Equipos</Link>
              <Link to="/mis-reservas" style={{ color: '#61dafb', textDecoration: 'none', fontWeight: 'bold' }}>Mis Reservas</Link>
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