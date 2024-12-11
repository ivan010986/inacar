// import React, { useState, useEffect } from "react";
// import { getCookie } from "../../src/utils/cookieUtils";

// const Search = () => {
//   const [filteredData, setFilteredData] = useState([]);
//   const [presupuestosData, setPresupuestosData] = useState([]);
//   const [uen, setUen] = useState("");
//   const [zona, setZona] = useState("");
//   const [rubro, setRubro] = useState("");
//   const [subrubro, setSubrubro] = useState("");
//   const [searchText, setSearchText] = useState("");
//   const [rubroSeleccionado, setRubroSeleccionado] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const csrftoken = getCookie("csrftoken");
//         const token = localStorage.getItem("token");
//         const API_URL =
//           process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
//         const presupuestosResponse = await fetch(
//           `${API_URL}/InformeDetalladoPresupuesto/`,
//           {
//             method: "GET",
//             headers: {
//               "X-CSRFToken": csrftoken,
//               Authorization: `Token ${token}`,
//               "Content-Type": "application/json",
//             },
//             credentials: "include",
//           }
//         );

//         if (!presupuestosResponse.ok)
//           throw new Error(`HTTP error! Status: ${presupuestosResponse.status}`);

//         const data = await presupuestosResponse.json();
//         if (data.length === 0) {
//           setError("No existe información.");
//           setFilteredData([]);
//           return;
//         }

//         setPresupuestosData(data); // Guardamos la respuesta de la API en el estado
//       } catch (error) {
//         console.error("Error fetching data:", error);
//         setError("Error al obtener los datos. Por favor intenta de nuevo.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   const handleSearch = () => {
//     let filtered = presupuestosData;

//     // Filtrar por UEN y Zona
//     if (uen) {
//       filtered = filtered.filter((item) => item.uen.nombre.includes(uen));
//     }
//     if (zona) {
//       filtered = filtered.filter((item) => item.cuenta.regional.includes(zona));
//     }

//     // Filtrar por Rubro
//     if (rubro) {
//       filtered = filtered.filter((item) =>
//         item.updatedRubros.some((r) => r.nombre === rubro)
//       );
//     }

//     // Filtrar por Subrubro
//     if (subrubro) {
//       filtered = filtered.filter((item) =>
//         item.updatedRubros.some((r) =>
//           r.subrubros.some((s) => s.nombre === subrubro)
//         )
//       );
//     }

//     // Filtrar por texto (nombre de cuenta o usuario)
//     if (searchText) {
//       filtered = filtered.filter(
//         (item) =>
//           item.cuenta.nombre.includes(searchText) ||
//           item.usuario.first_name.includes(searchText) ||
//           item.usuario.last_name.includes(searchText)
//       );
//     }

//     setFilteredData(filtered);
//   };

//   return (
//     <>
//       <div
//         style={{
//           display: "flex",
//           margin: "10px",
//           flexDirection: "row",
//           justifyContent: "space-between",
//           width: "600px",
//         }}
//       >
//         <select
//           onChange={(e) => setUen(e.target.value)}
//           style={{
//             borderRadius: 12,
//             padding: "5px",
//             boxShadow: "0px 1px 2px grey",
//             border: "none",
//           }}
//         >
//           <option value="">UEN</option>
//           <option value="Constructora">Constructora</option>
//           <option value="Inmobiliaria">Inmobiliaria</option>
//           <option value="Promotora">Promotora</option>
//           <option value="Unidad de Apoyo">Unidad de Apoyo</option>
//         </select>

//         <select
//           onChange={(e) => setZona(e.target.value)}
//           style={{
//             borderRadius: 12,
//             padding: "5px",
//             boxShadow: "0px 1px 2px grey",
//             border: "none",
//           }}
//         >
//           <option value="">Zona</option>
//           <option value="Centro">Centro</option>
//           <option value="Norte">Norte</option>
//           <option value="Oriente">Oriente</option>
//           <option value="Occidente">Occidente</option>
//           <option value="Nacional">Nacional</option>
//         </select>

//         {presupuestosData.length > 0 && (
//           <select
//             onChange={(e) => {
//               setRubro(e.target.value);
//               setRubroSeleccionado(e.target.value);
//             }}
//             style={{
//               borderRadius: 12,
//               padding: "5px",
//               boxShadow: "0px 1px 2px grey",
//               border: "none",
//             }}
//           >
//             <option value="">Rubro</option>
//             {presupuestosData[0].updatedRubros.map((rubro) => (
//               <option key={rubro.id} value={rubro.nombre}>
//                 {rubro.nombre}
//               </option>
//             ))}
//           </select>
//         )}

//         {rubroSeleccionado && (
//           <select
//             onChange={(e) => setSubrubro(e.target.value)}
//             style={{
//               borderRadius: 12,
//               padding: "5px",
//               boxShadow: "0px 1px 2px grey",
//               border: "none",
//             }}
//           >
//             <option value="">Subrubro</option>
//             {presupuestosData[0].updatedRubros
//               .find((rubro) => rubro.nombre === rubroSeleccionado)
//               ?.subrubros.map((subrubro) => (
//                 <option key={subrubro.id} value={subrubro.nombre}>
//                   {subrubro.nombre}
//                 </option>
//               ))}
//           </select>
//         )}

//         <input
//           type="text"
//           placeholder="Buscar..."
//           style={{
//             borderRadius: 12,
//             padding: "5px",
//             boxShadow: "0px 1px 2px grey",
//             border: "none",
//           }}
//           value={searchText}
//           onChange={(e) => setSearchText(e.target.value)}
//         />
//         <button onClick={handleSearch}>Buscar</button>
//       </div>

//       {loading && <p>Cargando datos...</p>}
//       {error && <p>{error}</p>}

//       {filteredData.length === 0 ? (
//         <p>No se encontraron resultados</p>
//       ) : (
//         <table>
//           <thead>
//             <tr>
//               <th>UEN</th>
//               <th>Zona</th>
//               <th>Rubro</th>
//               <th>Subrubro</th>
//               <th>Presupuesto</th>
//             </tr>
//           </thead>
//           <tbody></tbody>
//         </table>
//       )}
//     </>
//   );
// };

// export default Search;


import React, { useState, useEffect } from "react";
import ReportTable from "@/components/reportTable";
import Sidebar from "@/components/sidebar";
import { getCookie } from "../../src/utils/cookieUtils";
import { useRouter } from "next/router";
import { Grid, Typography, Button } from "@mui/material";

const Search = () => {
  const [presupuestos, setPresupuestos] = useState([]);
  const [rubros, setRubros] = useState([]);
  const [subrubros, setSubRubros] = useState([]);
  const [rubroTotales, setRubroTotales] = useState({});
  const [SubRubroTotales, setSubRubroTotales] = useState({});
  const [itemTotales, setItemTotales] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const csrftoken = getCookie("csrftoken");
        const token = localStorage.getItem("token");
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const presupuestosResponse = await fetch(`${API_URL}/InformeDetalladoPresupuesto/`, {
          method: "GET",
          headers: {
            "X-CSRFToken": csrftoken,
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!presupuestosResponse.ok) throw new Error(`HTTP error! Status: ${presupuestosResponse.status}`);
        const presupuestosData = await presupuestosResponse.json();

        if (presupuestosData.length === 0) {
          setError("No existe información.");
          return;
        }

        // Organizar los datos extraídos como en el código anterior
        const totalPorRubro = {};
        const totalPorSubRubro = {};
        const totalPorCuenta = {};

        presupuestosData.forEach((presupuesto) => {
          // Procesar datos...
        });

        setRubroTotales(totalPorRubro);
        setSubRubroTotales(totalPorSubRubro);
        setItemTotales(totalPorCuenta);

      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to fetch data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const columnsRubros = [
    { label: "Rubro", field: "nombre" },
    { label: "Total", field: "total" },
  ];

  const columnsSubRubros = [
    { label: "Código", field: "codigo" },
    { label: "Nombre", field: "nombre" },
    { label: "Total", field: "total" },
  ];

  const columnsCuentas = [
    { label: "Código", field: "codigo" },
    { label: "Nombre", field: "nombre" },
    { label: "Regional", field: "regional" },
    { label: "Total", field: "total" },
  ];

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4">Informe Detallado de Presupuesto</Typography>
      </Grid>

      {error ? (
        <Grid item xs={12}>
          <Typography color="error">{error}</Typography>
        </Grid>
      ) : (
        <>
          {/* Tabla de Rubros */}
          <Grid item xs={12}>
            <Typography variant="h6">Totales por Rubro</Typography>
            <ReportTable columns={columnsRubros} data={Object.entries(rubroTotales).map(([nombre, total]) => ({ nombre, total }))} />
          </Grid>

          {/* Tabla de SubRubros */}
          <Grid item xs={12}>
            <Typography variant="h6">Totales por SubRubro</Typography>
            <ReportTable columns={columnsSubRubros} data={Object.values(SubRubroTotales)} />
          </Grid>

          {/* Tabla de Cuentas */}
          <Grid item xs={12}>
            <Typography variant="h6">Totales por Cuenta</Typography>
            <ReportTable columns={columnsCuentas} data={Object.values(itemTotales)} />
          </Grid>
        </>
      )}
    </Grid>
  );
};

export default Search;