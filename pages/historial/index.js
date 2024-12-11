//index.js
import Sidebar from "@/components/sidebar";
import CardStorage from "@/components/cardStorage";
import { useEffect, useState } from "react";
import { getCookie } from "../../src/utils/cookieUtils";
import { useRouter } from "next/router";
import withAuth from "../api/auth/withAuth";
import { openDB } from "idb";
import LoadingModal from "@/components/loading";

const Storage = () => {
  const [updatedRubros, setUpdatedRubros] = useState([]); 
  const [updatedPresupuestos, setPresupuestos] = useState([]);
  const [userId, setUserId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  let dbInstance = null;

  const initDB = async () => {
    if (dbInstance) return dbInstance;
    dbInstance = await openDB("PresupuestoDB");
    const newVersion = dbInstance.version + 1;
    dbInstance.close();
    dbInstance = await openDB("PresupuestoDB", newVersion, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("rubrosData")) {
          db.createObjectStore("rubrosData");
        }
      },
    });
    return dbInstance;
  };

  const clearDataInDB = async (currentView) => {
    try {
      const db = await initDB();
      
      // Vaciar datos de rubrosData (si es necesario)
      await db.put("rubrosData", {
        updatedRubros: [],
        monthlyTotals: Array(12).fill(0),
        rubrosTotals: {},
        inputs: {},
      }, `${currentView}_rubrosData`);
      
    } catch (error) {
      console.error("Error al vaciar datos en IndexedDB:", error);
    }
  };

  const saveDataToDB = async (key, data) => {
    const db = await initDB();
    try {
      await db.put("rubrosData", data, key);
    } catch (error) {
      console.error("Error fetching data from DB:", error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const csrftoken = getCookie("csrftoken");
        const token = localStorage.getItem("token");
        let allData = [];
        let page = 1;
        let totalPages = 1;
        do {
          const presupuestosResponse = await fetch(
            `${API_URL}/HistorialPresupuesto/?page=${page}`,
            {
              method: "GET",
              headers: {
                "X-CSRFToken": csrftoken,
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
              },
              credentials: "include",
              keepalive: true 
            }
          );
    
          if (!presupuestosResponse.ok) {
            const errorText = await presupuestosResponse.text();
            console.error("Error Response Text:", errorText);
            throw new Error(`HTTP error! Status: ${presupuestosResponse.status}`);
          }
    
          const data = await presupuestosResponse.json();
          allData = [...allData, ...data.results]; // Concatenate new data
          totalPages = Math.ceil(data.count / 3000); // Update total pages
          page++; // Move to the next page
        } while (page <= totalPages);
    
        // setUpdatedRubros(allData[0].updatedRubros);
        // const organizedData = organizeData(allData);
        // setData(organizedData);    credentials: "include",
        //   keepalive: true 
        // });

        // if (!response.ok) {
        //   console.error(`HTTP error! Status: ${response.status} - ${response.statusText}`);
        //   throw new Error(`HTTP error! Status: ${response.status}`);
        // }
        
        // const data = await response.json();
        // const results = data.results || []; // This will be an array
        // console.log(results, data);
        // Transform the results data
        const transformedData = allData.map((item) => ({
          id: item.id,
          usuario: item.usuario,
          uen: item.uen,
          codigo: item.cuenta,
          rubro: item.rubro,
          subrubro: item.subrubro,
          auxiliar: item.auxiliar,
          item: item.item,
          meses: item.meses,
          value: item.presupuestomes,
          fecha: item.fecha,
          rubrosTotals: item.rubrosTotals,
          updatedRubros: item.updatedRubros,
          monthlyTotals: item.monthlyTotals,
        }));
        console.log(transformedData);
        setPresupuestos(transformedData || []);
        // Set updatedRubros here, assuming it's the same across all items in transformedData
        // if (transformedData.length > 0) {
        //   setUpdatedRubros(transformedData[0].updatedRubros || []);
        // }
      } catch (error) {
        console.error("Error fetching data:", error);
      }finally {
        setIsLoading(false);
      }
    };

    if (!userId) {
      fetchData();
    }
  }, [userId]);
  
  const uniquePresupuestos = Array.from(
    new Map(
      updatedPresupuestos.map((presupuesto) => {
        const year = new Date(presupuesto.fecha).getFullYear();
        const uniqueKey = `${presupuesto.uen.nombre}-${presupuesto.usuario.id}-${year}`;
        return [uniqueKey, presupuesto];
      })
    ).values()
  );

  const handleCardClick = async (nombre, usuarioId, fecha) => {
    const targetYear = new Date(fecha).getFullYear();
    const filteredPresupuestos = updatedPresupuestos.filter((item) => {
      const itemYear = new Date(item.fecha).getFullYear();
      return (
        item.uen.nombre.toLowerCase() === nombre.toLowerCase() &&
        item.usuario.id === usuarioId &&
        itemYear === targetYear 
      );
    });


    // Iterate through filteredPresupuestos to construct input IDs and values
    if (filteredPresupuestos.length > 0) {
      const newInputValues = {};
      // const RubrosTotals = {}; // Initialize an object to hold updated rubros totals
      // const newMonthlyTotals = Array(12).fill(0); // Initialize an array for monthly totals
    
      // Iterate over each entry in filtered presupuestos
      filteredPresupuestos.forEach((entry) => {
        const inputId = `outlined-basic-${entry.rubro}-${entry.subrubro}-${entry.auxiliar}-${entry.item}-${entry.meses}`;
        newInputValues[inputId] = { ...entry };
    
      //   // Update rubros totals and monthly totals
      //   const rubroName = entry.rubro; // Assuming rubro is the key name
      //   const monthValues = entry.monthlyTotals || []; // Assuming monthlyTotals are available in the entry
    
      //   // Initialize rubro totals if not already present
      //   if (!RubrosTotals[rubroName]) {
      //     RubrosTotals[rubroName] = Array(12).fill(0);
      //   }
    
      //   // Update rubros totals and monthly totals based on the current entry
      //   monthValues.forEach((value, monthIndex) => {
      //     if (value) {
      //       RubrosTotals[rubroName][monthIndex] += value; // Update rubro totals
      //       newMonthlyTotals[monthIndex] += value; // Update monthly totals
      //     }
      //   });
      });
    
      // setInputValues(newInputValues);
      const currentView = nombre === "Unidades de Apoyo" ? "unidad-apoyo" : nombre.toLowerCase();
    
      await clearDataInDB(currentView);
      // Generate labeled rubros totals by comparing indexes with updatedRubros
      // const labeledRubrosTotals = {};
      // const updatedRubros = filteredPresupuestos[filteredPresupuestos.length - 1].updatedRubros

      // // Create labeledRubrosTotals with the actual rubro names from updatedRubros
      // Object.keys(RubrosTotals).forEach((key, index) => {
      //   const rubroLabel = updatedRubros[index]?.nombre;
      //   if (rubroLabel) {
      //     labeledRubrosTotals[rubroLabel] = RubrosTotals[key];
      //   }
      // });

      await saveDataToDB(`${currentView}_rubrosData`, {
        inputs: newInputValues,
        id: filteredPresupuestos.map((entry) => entry.id),
        centroCostoid: filteredPresupuestos.map((entry) => entry.codigo),
        rubrosTotals: filteredPresupuestos[filteredPresupuestos.length - 1].rubrosTotals,
        updatedRubros: filteredPresupuestos[filteredPresupuestos.length - 1].updatedRubros,
        monthlyTotals: filteredPresupuestos[filteredPresupuestos.length - 1].monthlyTotals,
      });
    
      router.push(`/uen/${currentView}`);
    } else {
      console.error("No se encontraron presupuestos para la UEN seleccionada");
    }      
  };

  
  return (
    <>
    if (isLoading) return <LoadingModal open={isLoading} />
      <div style={{ display: "flex", flexDirection: "row", height: "100vh" }}>
        <Sidebar />
        <div style={{ display: "flex", flexDirection: "column", width: "80%" }}>
          {uniquePresupuestos.length > 0 &&
            uniquePresupuestos.map((presupuesto, index) => (
              <CardStorage
                key={index}
                area={`${presupuesto.uen.nombre || "N/A"}`}
                user={`${presupuesto.usuario.first_name} ${presupuesto.usuario.last_name}`}
                date={`${new Date(presupuesto.fecha).getFullYear() || "N/A"}`}
                click={() =>
                  handleCardClick(
                    presupuesto.uen.nombre,
                    presupuesto.usuario.id,
                    presupuesto.fecha,
                  )
                }
              />
            ))}
        </div>
      </div>
    </>
  );
};

export default withAuth(Storage);
