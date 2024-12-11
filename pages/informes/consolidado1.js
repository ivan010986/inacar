import React, { useState, useEffect } from "react";
import Sidebar from "@/components/sidebar";
import { getCookie } from "../../src/utils/cookieUtils";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LoadingModal from "@/components/loading";
import informeStyles from "../../src/styles/informe.js";
import * as XLSX from "xlsx";
import { Button } from "@mui/material";

const Consolidado = () => {
  const [data, setData] = useState([]);
  const [DataActual, setDataActual] = useState([]);
  const [updatedRubros, setUpdatedRubros] = useState([]);
  const [updatedRubrosActualizado, setUpdatedRubrosActualizado] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isTotalVisible, setIsTotalVisible] = useState(true);
  const [isUtilidadVisible, setIsUtilidadVisible] = useState(true);

  const organizeData = (data) => {
    const organizedData = {};

    data.forEach((item) => {
      const year = new Date(item.fecha).getFullYear();
      const uen = item.uen;
      const zone = item.cuenta.regional;
      const rubroIndex = item.rubro;
      const subrubroIndex = item.subrubro;
      const auxiliarIndex = item.auxiliar;
      const cuentaCodigo = item.cuenta.codigo;
      const cuentaNombre = item.cuenta.nombre.trim();
      // Sumar todos los valores de presupuestomes en meses_presupuesto
      const totalPresupuestoMes = item.meses_presupuesto.reduce(
        (total, mes) => {
          return total + parseFloat(mes.presupuestomes);
        },
        0
      );
      // Initialize data structure
      if (!organizedData[year]) organizedData[year] = {};
      if (!organizedData[year][uen])
        organizedData[year][uen] = { total: 0, zones: {} };
      if (!organizedData[year][uen].zones[zone])
        organizedData[year][uen].zones[zone] = { total: 0, rubros: {} };
      if (!organizedData[year][uen].zones[zone].rubros[rubroIndex]) {
        organizedData[year][uen].zones[zone].rubros[rubroIndex] = {
          total: 0,
          subrubros: {},
        };
      }

      if (
        !organizedData[year][uen].zones[zone].rubros[rubroIndex].subrubros[
          subrubroIndex
        ]
      ) {
        organizedData[year][uen].zones[zone].rubros[rubroIndex].subrubros[
          subrubroIndex
        ] = {
          total: 0,
          auxiliares: {},
        };
      }
      if (
        !organizedData[year][uen].zones[zone].rubros[rubroIndex].subrubros[
          subrubroIndex
        ].auxiliares[auxiliarIndex]
      ) {
        organizedData[year][uen].zones[zone].rubros[rubroIndex].subrubros[
          subrubroIndex
        ].auxiliares[auxiliarIndex] = {
          total: 0,
          cuentas: {},
        };
      }

      // Group by cuentaCodigo
      const cuentaAgrupada =
        organizedData[year][uen].zones[zone].rubros[rubroIndex].subrubros[
          subrubroIndex
        ].auxiliares[auxiliarIndex].cuentas;
      if (!cuentaAgrupada[cuentaCodigo]) {
        cuentaAgrupada[cuentaCodigo] = {
          nombre: cuentaNombre,
          total: 0,
        };
      }
      cuentaAgrupada[cuentaCodigo].total += totalPresupuestoMes;

      // Update subrubro and auxiliar totals regardless of exclusion
      organizedData[year][uen].zones[zone].rubros[rubroIndex].subrubros[
        subrubroIndex
      ].auxiliares[auxiliarIndex].total += totalPresupuestoMes;
      organizedData[year][uen].zones[zone].rubros[rubroIndex].subrubros[
        subrubroIndex
      ].total += totalPresupuestoMes;

      if ([16].includes(subrubroIndex)) {
      } else {
        // Agregar a los totales de rubro, zona y UEN si no es "HONORARIOS INTERNOS"
        organizedData[year][uen].zones[zone].rubros[rubroIndex].total +=
          totalPresupuestoMes;
        organizedData[year][uen].zones[zone].total += totalPresupuestoMes;
        organizedData[year][uen].total += totalPresupuestoMes;
      }
    });

    return organizedData;
  };
  const organizedDataActual = (DataActual) => {
    const organizedDataActualizado = {};

    DataActual.forEach((item, index) => {
        const year = new Date(item.fecha).getFullYear();
        const uen = item.uen || "Desconocido"; // Valor predeterminado si falta `uen`
        const zones = item.cuenta?.regional || "Desconocido"; // Valor predeterminado si falta `regional`
        const rubroIndex = item.rubro;
        const subrubroIndex = item.subrubro;
        const auxiliarIndex = item.auxiliar;
        const cuentaCodigo = item.cuenta?.codigo;
        const cuentaNombre = item.cuenta?.nombre?.trim() || "Sin nombre"; // Valor predeterminado si falta `nombre`

        // Verificar si `zone`, `uen` y `rubroIndex` existen y son válidos antes de continuar
        if (!zones || !uen || rubroIndex === undefined) {
            console.warn(`Item ${index} tiene datos incompletos: ${JSON.stringify(item)}`);
            return; // Saltar este item si faltan datos clave
        }

        // Sumar todos los valores de presupuestomes en meses_presupuesto
        const totalPresupuestoMes = item.meses_presupuesto?.reduce(
            (total, mes) => total + parseFloat(mes.presupuestomes || 0), 0
        ) || 0; // Asegurar que totalPresupuestoMes tenga un valor numérico válido

        // Inicializar la estructura de datos si es necesario
        if (!organizedDataActualizado[year]) organizedDataActualizado[year] = {};
        if (!organizedDataActualizado[year][uen])
            organizedDataActualizado[year][uen] = { total: 0, zonesActual: {} };
        if (!organizedDataActualizado[year][uen].zonesActual[zones])
            organizedDataActualizado[year][uen].zonesActual[zones] = { total: 0, rubrosActual: {} };
        if (!organizedDataActualizado[year][uen].zonesActual[zones].rubrosActual[rubroIndex]) {
            organizedDataActualizado[year][uen].zonesActual[zones].rubrosActual[rubroIndex] = { total: 0, subrubros: {} };
        }

      if (!organizedDataActualizado[year][uen].zonesActual[zones].rubrosActual[rubroIndex].subrubros[subrubroIndex]) {
        organizedDataActualizado[year][uen].zonesActual[zones].rubrosActual[rubroIndex].subrubros[subrubroIndex] = {
          total: 0,
          auxiliares: {},
        };
      }
      if (!organizedDataActualizado[year][uen].zonesActual[zones].rubrosActual[rubroIndex].subrubros[subrubroIndex].auxiliares[auxiliarIndex]) {
        organizedDataActualizado[year][uen].zonesActual[zones].rubrosActual[rubroIndex].subrubros[subrubroIndex].auxiliares[auxiliarIndex] = {
          total: 0,
          cuentas: {},
        };
      }

      // Group by cuentaCodigo
      const cuentaAgrupada = organizedDataActualizado[year][uen].zonesActual[zones].rubrosActual[rubroIndex].subrubros[subrubroIndex].auxiliares[auxiliarIndex].cuentas;
      if (!cuentaAgrupada[cuentaCodigo]) {cuentaAgrupada[cuentaCodigo] = {
          nombre: cuentaNombre,
          total: 0,
        };
      }
      cuentaAgrupada[cuentaCodigo].total += totalPresupuestoMes;

      organizedDataActualizado[year][uen].zonesActual[zones].rubrosActual[rubroIndex].subrubros[subrubroIndex].auxiliares[auxiliarIndex].total += totalPresupuestoMes;
      organizedDataActualizado[year][uen].zonesActual[zones].rubrosActual[rubroIndex].subrubros[subrubroIndex].total += totalPresupuestoMes;

      if ([16].includes(subrubroIndex)) {
      } else {
        // Agregar a los totales de rubro, zona y UEN si no es "HONORARIOS INTERNOS"
        organizedDataActualizado[year][uen].zonesActual[zones].rubrosActual[rubroIndex].total += totalPresupuestoMes;
        organizedDataActualizado[year][uen].zonesActual[zones].total += totalPresupuestoMes;
        organizedDataActualizado[year][uen].total += totalPresupuestoMes;
      }
    });

    return organizedDataActualizado;
  };

  const handleToggle = () => {
    setIsVisible(!isVisible);
  };

  const handleTotalToggle = () => {
    setIsTotalVisible(!isTotalVisible);
  };

  const handleUtilidadToggle = () => {
    setIsUtilidadVisible(!isUtilidadVisible);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const csrftoken = getCookie("csrftoken");
      const token = localStorage.getItem("token");
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      let allData = [];
      let page = 1;
      let totalPages = 1;
      do {
        const presupuestosResponse = await fetch(
          `${API_URL}/InformeDetalladoPresupuesto/?page=${page}`,
          {
            method: "GET",
            headers: {
              "X-CSRFToken": csrftoken,
              Authorization: `Token ${token}`,
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (!presupuestosResponse.ok) {
          const errorText = await presupuestosResponse.text();
          console.error("Error Response Text:", errorText);
          throw new Error(`HTTP error! Status: ${presupuestosResponse.status}`);
        }

        const data = await presupuestosResponse.json();
        allData = [...allData, ...data.results]; // Concatenate new data

        totalPages = Math.ceil(data.count / 3000);
        page++; // Move to the next page
      } while (page <= totalPages);

      setUpdatedRubros(allData[0].updatedRubros);
      const organizedData = organizeData(allData);
      setData(organizedData);

      page = 1;
      do {
        const presupuestosResponse = await fetch(
          `${API_URL}/Actualizado/?page=${page}`,
          {
            method: "GET",
            headers: {
              "X-CSRFToken": csrftoken,
              Authorization: `Token ${token}`,
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (!presupuestosResponse.ok) {
          const errorText = await presupuestosResponse.text();
          console.error("Error Response Text:", errorText);
          throw new Error(`HTTP error! Status: ${presupuestosResponse.status}`);
        }

        const data = await presupuestosResponse.json();
        allData = [...allData, ...data.results]; // Concatenate new data

        totalPages = Math.ceil(data.count / 3000) || 1;
        page++; // Move to the next page
      } while (page <= totalPages);

      setUpdatedRubrosActualizado(allData[0].updatedRubros);
      const organizedDataActualizado = organizedDataActual(allData);
      setDataActual(organizedDataActualizado);
    } catch (error) {
      console.error("Fetch error:", error);
      setError(error.message); // Guardar el mensaje de error en el estado
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const calculateTotals = (zones) => {
    let ingresosOperacionalesTotal = 0;
    let costosIndirectosTotal = 0;
    let costosDeVentaTotal = 0;
    let gastosOperacionalesAdministrativosTotal = 0;
    let gastosOperacionalesComercialesTotal = 0;
    let ingresosNoOperacionalesTotal = 0;
    let gastosNoOperacionalesTotal = 0;

    // Iterar por zonas y rubros para calcular los totales
    Object.values(zones).forEach(({ rubros }) => {
      Object.entries(rubros).forEach(([rubroIndex, rubroData]) => {
        const rubroName = updatedRubros[rubroIndex]?.nombre;

        if (rubroName === "INGRESOS OPERACIONALES") {
          ingresosOperacionalesTotal += rubroData.total;
        } else if (rubroName === "COSTOS INDIRECTOS") {
          costosIndirectosTotal += rubroData.total;
        } else if (rubroName === "COSTOS DE VENTA") {
          costosDeVentaTotal += rubroData.total;
        } else if (rubroName === "GASTOS OPERACIONALES DE ADMINISTRACION") {
          gastosOperacionalesAdministrativosTotal += rubroData.total;
        } else if (rubroName === "GASTOS OPERACIONALES DE COMERCIALIZACION") {
          gastosOperacionalesComercialesTotal += rubroData.total;
        } else if (rubroName === "INGRESOS NO OPERACIONALES") {
          ingresosNoOperacionalesTotal += rubroData.total;
        } else if (rubroName === "GASTOS NO OPERACIONALES") {
          gastosNoOperacionalesTotal += rubroData.total;
        }
      });
    });

    const utilidadBruta =
      ingresosOperacionalesTotal - costosDeVentaTotal - costosIndirectosTotal;
    const utilidadoPerdidaOperacional =
      utilidadBruta -
      gastosOperacionalesAdministrativosTotal -
      gastosOperacionalesComercialesTotal;
    const utilidadAntesDeImpuesto =
      utilidadoPerdidaOperacional +
      ingresosNoOperacionalesTotal -
      gastosNoOperacionalesTotal;

    return {
      gastosNoOperacionalesTotal,
      ingresosNoOperacionalesTotal,
      utilidadAntesDeImpuesto,
      ingresosOperacionalesTotal,
      costosIndirectosTotal,
      costosDeVentaTotal,
      utilidadBruta,
      utilidadoPerdidaOperacional,
      gastosOperacionalesAdministrativosTotal,
      gastosOperacionalesComercialesTotal,
    };
  };

const calculateTotalsActualizado = (zonesActual) => {
    console.log("Contenido de zones en Actualizado:", zonesActual);
    let ingresosOperacionalesTotalActualizado = 0;
    let costosIndirectosTotalActualizado = 0;
    let costosDeVentaTotalActualizado = 0;
    let gastosOperacionalesAdministrativosTotalActualizado = 0;
    let gastosOperacionalesComercialesTotalActualizado = 0;
    let ingresosNoOperacionalesTotalActualizado = 0;
    let gastosNoOperacionalesTotalActualizado = 0;

    // Iterar por zonas y rubros para calcular los totales
    Object.values(zonesActual).forEach((zones) => {
        const rubrosActual = zones.rubros;
        console.log("Rubros para la zona:", rubrosActual);

        // Verificar si rubrosActual existe antes de continuar
        if (!rubrosActual) {
            console.warn("rubrosActual está indefinido para esta zona:", zones);
            return; // Saltar esta zona si rubrosActual es indefinido
        }

        Object.entries(rubrosActual).forEach(([rubroIndex, rubroData]) => {
            const rubroName = updatedRubrosActualizado[rubroIndex]?.nombre;
            const rubroTotal = rubroData.total || 0;

            // Verificar si rubroTotal es negativo o inválido
            if (isNaN(rubroTotal)) {
                console.error(`Invalid total for rubro: ${rubroName}. Total is NaN.`);
                return;
            }

            if (rubroTotal < 0) {
                console.warn(`Rubro ${rubroName} tiene un valor negativo: ${rubroTotal}`);
            }

            if (rubroName === "INGRESOS OPERACIONALES") {
                ingresosOperacionalesTotalActualizado += rubroTotal;
            } else if (rubroName === "COSTOS INDIRECTOS") {
                costosIndirectosTotalActualizado += rubroTotal;
            } else if (rubroName === "COSTOS DE VENTA") {
                costosDeVentaTotalActualizado += rubroTotal;
            } else if (rubroName === "GASTOS OPERACIONALES DE ADMINISTRACION") {
                gastosOperacionalesAdministrativosTotalActualizado += rubroTotal;
            } else if (rubroName === "GASTOS OPERACIONALES DE COMERCIALIZACION") {
                gastosOperacionalesComercialesTotalActualizado += rubroTotal;
            } else if (rubroName === "INGRESOS NO OPERACIONALES") {
                ingresosNoOperacionalesTotalActualizado += rubroTotal;
            } else if (rubroName === "GASTOS NO OPERACIONALES") {
                gastosNoOperacionalesTotalActualizado += rubroTotal;
            }
        });
    });

    const utilidadBrutaActualizado =
        ingresosOperacionalesTotalActualizado -
        costosDeVentaTotalActualizado -
        costosIndirectosTotalActualizado;

    const utilidadoPerdidaOperacionalActualizado =
        utilidadBrutaActualizado -
        gastosOperacionalesAdministrativosTotalActualizado -
        gastosOperacionalesComercialesTotalActualizado;

    const utilidadAntesDeImpuestoActualizado =
        utilidadoPerdidaOperacionalActualizado +
        ingresosNoOperacionalesTotalActualizado -
        gastosNoOperacionalesTotalActualizado;

    console.log("Totales finales calculados en 'Actualizado':", {
        ingresosOperacionalesTotalActualizado,
        costosIndirectosTotalActualizado,
        costosDeVentaTotalActualizado,
        gastosOperacionalesAdministrativosTotalActualizado,
        gastosOperacionalesComercialesTotalActualizado,
        ingresosNoOperacionalesTotalActualizado,
        gastosNoOperacionalesTotalActualizado,
        utilidadBrutaActualizado,
        utilidadoPerdidaOperacionalActualizado,
        utilidadAntesDeImpuestoActualizado,
    });

    return {
        gastosNoOperacionalesTotalActualizado,
        ingresosNoOperacionalesTotalActualizado,
        utilidadAntesDeImpuestoActualizado,
        ingresosOperacionalesTotalActualizado,
        costosIndirectosTotalActualizado,
        costosDeVentaTotalActualizado,
        utilidadBrutaActualizado,
        utilidadoPerdidaOperacionalActualizado,
        gastosOperacionalesAdministrativosTotalActualizado,
        gastosOperacionalesComercialesTotalActualizado,
    };
  };


  const calculateTotalsByZoneActualizado = (
    zones,
    updatedRubrosActualizado
  ) => {
    const TotalsByZoneActualizado = {};

    // Iterate over zones and rubros to calculate totals by zone
    Object.entries(zones).forEach(([zoneName, { rubros }]) => {
      // Initialize totals object for the zone if it doesn't exist
      if (!TotalsByZoneActualizado[zoneName]) {
        TotalsByZoneActualizado[zoneName] = {
          zonaingresosOperacionalesTotalActualizado: 0,
          zonacostosIndirectosTotalActualizado: 0,
          zonacostosDeVentaTotalActualizado: 0,
          zonagastosOperacionalesAdministrativosTotalActualizado: 0,
          zonagastosOperacionalesComercialesTotalActualizado: 0,
          zonautilidadBrutaActualizado: 0,
          zonautilidadPerdidaOperacionalActualizado: 0,
          zonaingresosNoOperacionalesTotalActualizado: 0,
          zonagastosNoOperacionalesTotalActualizado: 0,
        };
      }

      // Check if rubros is defined
      if (rubros) {
        Object.entries(rubros).forEach(([rubroIndex, rubroData]) => {
          const rubroName = updatedRubrosActualizado[rubroIndex]?.nombre;

          if (rubroName === "INGRESOS OPERACIONALES") {
            TotalsByZoneActualizado[
              zoneName
            ].zonaingresosOperacionalesTotalActualizado += rubroData.total;
          } else if (rubroName === "COSTOS INDIRECTOS") {
            TotalsByZoneActualizado[
              zoneName
            ].zonacostosIndirectosTotalActualizado += rubroData.total;
          } else if (rubroName === "COSTOS DE VENTA") {
            TotalsByZoneActualizado[
              zoneName
            ].zonacostosDeVentaTotalActualizado += rubroData.total;
          } else if (rubroName === "GASTOS OPERACIONALES DE ADMINISTRACION") {
            TotalsByZoneActualizado[
              zoneName
            ].zonagastosOperacionalesAdministrativosTotalActualizado +=
              rubroData.total;
          } else if (rubroName === "GASTOS OPERACIONALES DE COMERCIALIZACION") {
            TotalsByZoneActualizado[
              zoneName
            ].zonagastosOperacionalesComercialesTotalActualizado +=
              rubroData.total;
          } else if (rubroName === "INGRESOS NO OPERACIONALES") {
            TotalsByZoneActualizado[
              zoneName
            ].zonaingresosNoOperacionalesTotalActualizado += rubroData.total;
          } else if (rubroName === "GASTOS NO OPERACIONALES") {
            TotalsByZoneActualizado[
              zoneName
            ].zonagastosNoOperacionalesTotalActualizado += rubroData.total;
          }
        });
      }

      // Calculate gross profit and operational loss or profit for the current zone
      TotalsByZoneActualizado[zoneName].zonautilidadBrutaActualizado =
        TotalsByZoneActualizado[zoneName]
          .zonaingresosOperacionalesTotalActualizado -
        TotalsByZoneActualizado[zoneName].zonacostosDeVentaTotalActualizado -
        TotalsByZoneActualizado[zoneName].zonacostosIndirectosTotalActualizado;

      TotalsByZoneActualizado[
        zoneName
      ].zonautilidadPerdidaOperacionalActualizado =
        TotalsByZoneActualizado[zoneName].zonautilidadBrutaActualizado -
        TotalsByZoneActualizado[zoneName]
          .zonagastosOperacionalesAdministrativosTotalActualizado -
        TotalsByZoneActualizado[zoneName]
          .zonagastosOperacionalesComercialesTotalActualizado;

      TotalsByZoneActualizado[zoneName].zonautilidadAntesDeImpuestoActualizado =
        TotalsByZoneActualizado[zoneName]
          .zonautilidadPerdidaOperacionalActualizado +
        TotalsByZoneActualizado[zoneName]
          .zonaingresosNoOperacionalesTotalActualizado -
        TotalsByZoneActualizado[zoneName]
          .zonagastosNoOperacionalesTotalActualizado;
    });

    return TotalsByZoneActualizado;
  };

  const calculateTotalsByZone = (zones, updatedRubros) => {
    const totalsByZone = {};

    // Iterate over zones and rubros to calculate totals by zone
    Object.entries(zones).forEach(([zoneName, { rubros }]) => {
      // Initialize totals object for the zone if it doesn't exist
      if (!totalsByZone[zoneName]) {
        totalsByZone[zoneName] = {
          zonaingresosOperacionalesTotal: 0,
          zonacostosIndirectosTotal: 0,
          zonacostosDeVentaTotal: 0,
          zonagastosOperacionalesAdministrativosTotal: 0,
          zonagastosOperacionalesComercialesTotal: 0,
          zonautilidadBruta: 0,
          zonautilidadPerdidaOperacional: 0,
          zonaingresosNoOperacionalesTotal: 0,
          zonagastosNoOperacionalesTotal: 0,
        };
      }

      // Check if rubros is defined
      if (rubros) {
        Object.entries(rubros).forEach(([rubroIndex, rubroData]) => {
          const rubroName = updatedRubros[rubroIndex]?.nombre;

          if (rubroName === "INGRESOS OPERACIONALES") {
            totalsByZone[zoneName].zonaingresosOperacionalesTotal +=
              rubroData.total;
          } else if (rubroName === "COSTOS INDIRECTOS") {
            totalsByZone[zoneName].zonacostosIndirectosTotal += rubroData.total;
          } else if (rubroName === "COSTOS DE VENTA") {
            totalsByZone[zoneName].zonacostosDeVentaTotal += rubroData.total;
          } else if (rubroName === "GASTOS OPERACIONALES DE ADMINISTRACION") {
            totalsByZone[
              zoneName
            ].zonagastosOperacionalesAdministrativosTotal += rubroData.total;
          } else if (rubroName === "GASTOS OPERACIONALES DE COMERCIALIZACION") {
            totalsByZone[zoneName].zonagastosOperacionalesComercialesTotal +=
              rubroData.total;
          } else if (rubroName === "INGRESOS NO OPERACIONALES") {
            totalsByZone[zoneName].zonaingresosNoOperacionalesTotal +=
              rubroData.total;
          } else if (rubroName === "GASTOS NO OPERACIONALES") {
            totalsByZone[zoneName].zonagastosNoOperacionalesTotal +=
              rubroData.total;
          }
        });
      }

      // Calculate gross profit and operational loss or profit for the current zone
      totalsByZone[zoneName].zonautilidadBruta =
        totalsByZone[zoneName].zonaingresosOperacionalesTotal -
        totalsByZone[zoneName].zonacostosDeVentaTotal -
        totalsByZone[zoneName].zonacostosIndirectosTotal;

      totalsByZone[zoneName].zonautilidadPerdidaOperacional =
        totalsByZone[zoneName].zonautilidadBruta -
        totalsByZone[zoneName].zonagastosOperacionalesAdministrativosTotal -
        totalsByZone[zoneName].zonagastosOperacionalesComercialesTotal;

      totalsByZone[zoneName].zonautilidadAntesDeImpuesto =
        totalsByZone[zoneName].zonautilidadPerdidaOperacional +
        totalsByZone[zoneName].zonaingresosNoOperacionalesTotal -
        totalsByZone[zoneName].zonagastosNoOperacionalesTotal;
    });

    return totalsByZone;
  };

  const renderData = (data) => {
    return Object.entries(data).map(([year, uens]) => {
      // Calculate the total for "Unidades de Apoyo" to split among other UENs
      const apoyoTotal = uens["Unidades de Apoyo"]?.total || 0;

      // Split the total of "Unidades de Apoyo" (40% Constructora, 40% Promotora, 20% Inmobiliaria)
      const apoyoConstructoraShare = apoyoTotal * 0.4;
      const apoyoPromotoraShare = apoyoTotal * 0.4;
      const apoyoInmobiliariaShare = apoyoTotal * 0.2;

      return (
        <div key={year}>
          <Accordion key={year} sx={{ marginBottom: "20px", width: "150%" }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "white" }} />}aria-controls={`panel-${year}-content`}id={`panel-${year}-header`}sx={{ background: "#a6a2a2" }}>
              <Typography sx={{ color: "white" }}>
                INFORME DETALLADO DE RESULTADOS {year}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <div style={{display: "flex",flexWrap: "wrap",overflow: "auto",width: "150%",}}>
                {Object.entries(uens).map(
                  ([uen, { total: uenTotal, zones }]) => {
                    // Adjust the total for each UEN except "Unidades de Apoyo"
                    let adjustedTotal = uenTotal;
                    // Adjust the totals for Constructora, Promotora, and Inmobiliaria
                    if (uen === "Constructora") {
                      adjustedTotal += apoyoConstructoraShare;
                    } else if (uen === "Promotora") {
                      adjustedTotal += apoyoPromotoraShare;
                    } else if (uen === "Inmobiliaria") {
                      adjustedTotal += apoyoInmobiliariaShare;
                    }
                    const totalsByZone = calculateTotalsByZone(
                      zones,
                      updatedRubros
                    );
                    const TotalsByZoneActualizado =
                      calculateTotalsByZoneActualizado(
                        zones,
                        updatedRubrosActualizado
                      );
                    const {
                      gastosNoOperacionalesTotal,
                      ingresosNoOperacionalesTotal,
                      utilidadAntesDeImpuesto,
                      ingresosOperacionalesTotal,
                      costosIndirectosTotal,
                      costosDeVentaTotal,
                      utilidadBruta,
                      gastosOperacionalesAdministrativosTotal,
                      gastosOperacionalesComercialesTotal,
                      utilidadoPerdidaOperacional,
                    } = calculateTotalsProyectado(zones);

                    const {
                      gastosNoOperacionalesTotalActualizado,
                      ingresosNoOperacionalesTotalActualizado,
                      utilidadAntesDeImpuestoActualizado,
                      ingresosOperacionalesTotalActualizado,
                      costosIndirectosTotalActualizado,
                      costosDeVentaTotalActualizado,
                      utilidadBrutaActualizado,
                      gastosOperacionalesAdministrativosTotalActualizado,
                      gastosOperacionalesComercialesTotalActualizado,
                      utilidadoPerdidaOperacionalActualizado,
                    } = calculateTotalsActualizado(zones);

                    return (
                      <div key={uen}style={{ flex: "1 1 20%", margin: "0.2px" }}>
                        <div style={informeStyles.textContent}>
                          <Typography variant="caption"style={{ width: "25%" }}>
                            Detalle
                          </Typography>
                          <Typography variant="caption"style={{ width: "25%" }}>
                            Proyectado
                          </Typography>
                          <Typography variant="caption"style={{ width: "25%" }}>
                            Actualizado
                          </Typography>
                          <Typography variant="caption"style={{ width: "25%" }}>
                            Diferencia
                          </Typography>
                        </div>
                        <h4>
                          <div
                            style={uen == "Constructora"? informeStyles.uenConstructora: uen == "Inmobiliaria"? informeStyles.uenInmobiliaria: uen == "Unidades de Apoyo"? informeStyles.uenUA: informeStyles.uen}>
                            <Typography variant="caption"sx={{ color: "white", width: "25%" }}>
                              {uen}:
                            </Typography>
                            <Typography variant="caption"sx={{ color: "white", width: "25%" }}>
                              {adjustedTotal.toLocaleString("es-ES", {minimumFractionDigits: 0,maximumFractionDigits: 0,})}
                            </Typography>
                            <Typography variant="caption"sx={{ color: "white", width: "25%" }}>
                              {adjustedTotal.toLocaleString("es-ES", {minimumFractionDigits: 0,maximumFractionDigits: 0,})}
                            </Typography>
                            <Typography variant="caption"sx={{ color: "white", width: "25%" }}>
                              0
                            </Typography>
                          </div>
                        </h4>
                          <div
                            style={uen == "Constructora"? informeStyles.containerConstructora: uen == "Inmobiliaria"? informeStyles.containerInmobiliaria: uen == "Unidades de Apoyo"? informeStyles.containerUA: informeStyles.container}>
                            <div style={informeStyles.textContent}>
                              <Typography variant="caption"style={{ width: "25%",display: 'flex',alignItems: 'flex-start' }}>
                                Ingresos Operacionales:
                              </Typography>
                              <Typography variant="caption"style={{ width: "25%" }}>
                                {ingresosOperacionalesTotal.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,})}
                              </Typography>
                              <Typography variant="caption"style={{ width: "25%" }}>
                                {ingresosOperacionalesTotalActualizado.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,})}
                              </Typography>
                              <Typography variant="caption"style={{ width: "25%" }}>
                                {ingresosOperacionalesTotal.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,}
                                )  - ingresosOperacionalesTotalActualizado.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,})}
                              </Typography>
                            </div>
                            <div style={informeStyles.textContent}>
                              <Typography variant="caption"style={{ width: "25%" }}>
                                Costos Indirectos:
                              </Typography>
                              <Typography variant="caption"style={{ width: "25%" }}>
                                {costosIndirectosTotal.toLocaleString("es-ES", {minimumFractionDigits: 0,maximumFractionDigits: 0,})}
                              </Typography>
                              <Typography variant="caption"style={{ width: "25%" }}>
                                {costosIndirectosTotalActualizado.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,})}
                              </Typography>
                              <Typography variant="caption"style={{ width: "25%" }}>
                                {costosIndirectosTotal.toLocaleString("es-ES", {minimumFractionDigits: 0,maximumFractionDigits: 0,}
                                ) - costosIndirectosTotalActualizado.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,})}
                              </Typography>
                            </div>
                            <div style={informeStyles.textContent}>
                              <Typography variant="caption"style={{ width: "25%" }}>
                                Costos de Venta:
                              </Typography>
                              <Typography variant="caption"style={{ width: "25%" }}>
                                {costosDeVentaTotal.toLocaleString("es-ES", {minimumFractionDigits: 0,maximumFractionDigits: 0,})}
                              </Typography>
                              <Typography variant="caption"style={{ width: "25%" }}>
                                {costosDeVentaTotalActualizado.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,})}
                              </Typography>
                              <Typography variant="caption"style={{ width: "25%" }}>
                                {costosDeVentaTotal.toLocaleString("es-ES", {minimumFractionDigits: 0,maximumFractionDigits: 0,}
                                ) - costosDeVentaTotalActualizado.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,})}
                              </Typography>
                            </div>
                            <div
                              style={uen == "Constructora"? informeStyles.titleZuConstructora: uen == "Inmobiliaria"? informeStyles.titleZuInmobiliaria: uen == "Unidades de Apoyo"? informeStyles.titleZuUA: informeStyles.titleZu}>
                              <Typography variant="caption"style={{ width: "25%" }}>
                                Utilidad Bruta:
                              </Typography>
                              <Typography variant="caption"style={{ width: "25%" }}>
                                {utilidadBruta.toLocaleString("es-ES", {minimumFractionDigits: 0,maximumFractionDigits: 0,})}
                              </Typography>
                              <Typography variant="caption"style={{ width: "25%" }}>
                                {utilidadBrutaActualizado.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,})}
                              </Typography>
                              <Typography variant="caption"style={{ width: "25%" }}>
                                {utilidadBruta.toLocaleString("es-ES", {minimumFractionDigits: 0,maximumFractionDigits: 0,}
                                ) - utilidadBrutaActualizado.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,})}
                              </Typography>
                            </div>
                            <div style={informeStyles.textContent}>
                              <Typography variant="caption"style={{ width: "25%" }}>
                                Gastos de Administración:
                              </Typography>
                              <Typography variant="caption"style={{ width: "25%" }}>
                                {gastosOperacionalesAdministrativosTotal.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,})}
                              </Typography>
                              <Typography variant="caption"style={{ width: "25%" }}>
                                {gastosOperacionalesAdministrativosTotalActualizado.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,})}
                              </Typography>
                              <Typography variant="caption"style={{ width: "25%" }}>
                                {gastosOperacionalesAdministrativosTotal.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,}
                                ) - gastosOperacionalesAdministrativosTotalActualizado.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,})}
                              </Typography>
                            </div>
                            <div style={informeStyles.textContent}>
                              <Typography variant="caption"style={{ width: "25%" }}>
                                Gastos de Comercialización:
                              </Typography>
                              <Typography variant="caption"style={{ width: "25%" }}>
                                {gastosOperacionalesComercialesTotal.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,})}
                              </Typography>
                              <Typography variant="caption"style={{ width: "25%" }}>
                                {gastosOperacionalesComercialesTotalActualizado.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,})}
                              </Typography>
                              <Typography variant="caption"style={{ width: "25%" }}>
                                {gastosOperacionalesComercialesTotal.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,}
                                ) - gastosOperacionalesComercialesTotalActualizado.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,})}
                              </Typography>
                            </div>
                            <div
                              style={uen == "Constructora"? informeStyles.titleZuConstructora: uen == "Inmobiliaria"? informeStyles.titleZuInmobiliaria: uen == "Unidades de Apoyo"? informeStyles.titleZuUA: informeStyles.titleZu}>
                              <Typography variant="caption"style={{ width: "25%" }}>
                                Utilidad ó (PERDIDA) Operacional:
                              </Typography>
                              <Typography variant="caption"style={{ width: "25%" }}>
                                {utilidadoPerdidaOperacional.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,})}
                              </Typography>
                              <Typography variant="caption"style={{ width: "25%" }}>
                                {utilidadoPerdidaOperacionalActualizado.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,})}
                              </Typography>
                              <Typography variant="caption"style={{ width: "25%" }}>
                                {utilidadoPerdidaOperacional.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,}
                                ) - utilidadoPerdidaOperacionalActualizado.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,})}
                              </Typography>
                            </div>
                            <div style={informeStyles.textContent}>
                              <Typography variant="caption"style={{ width: "25%" }}>
                                Ingresos No Operacionales:
                              </Typography>
                              <Typography variant="caption"style={{ width: "25%" }}>
                                {ingresosNoOperacionalesTotal.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,})}
                              </Typography>
                              <Typography variant="caption"style={{ width: "25%" }}>
                                {ingresosNoOperacionalesTotalActualizado.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,})}
                              </Typography>
                              <Typography variant="caption"style={{ width: "25%" }}>
                                {ingresosNoOperacionalesTotal.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,}
                                ) - ingresosNoOperacionalesTotalActualizado.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,})}
                              </Typography>
                            </div>
                            <div style={informeStyles.textContent}>
                              <Typography variant="caption"style={{ width: "25%" }}>
                                Gastos No Operacionales:
                              </Typography>
                              <Typography variant="caption"style={{ width: "25%" }}>
                                {gastosNoOperacionalesTotal.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,})}
                              </Typography>
                              <Typography variant="caption"style={{ width: "25%" }}>
                                {gastosNoOperacionalesTotalActualizado.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,})}
                              </Typography>
                              <Typography variant="caption"style={{ width: "25%" }}>
                                {gastosNoOperacionalesTotal.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,}
                                ) - gastosNoOperacionalesTotalActualizado.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,})}
                              </Typography>
                            </div>
                            <div
                              style={uen == "Constructora"? informeStyles.titleZuConstructora: uen == "Inmobiliaria"? informeStyles.titleZuInmobiliaria: uen == "Unidades de Apoyo"? informeStyles.titleZuUA: informeStyles.titleZu}>
                              <Typography variant="caption"style={{ width: "25%" }}>
                                Utilidad Antes De Impuesto:
                              </Typography>
                              <Typography variant="caption"style={{ width: "25%" }}>
                                {utilidadAntesDeImpuesto.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,})}
                              </Typography>
                              <Typography variant="caption"style={{ width: "25%" }}>
                                {utilidadAntesDeImpuestoActualizado.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,})}
                              </Typography>
                              <Typography variant="caption"style={{ width: "25%" }}>
                                {utilidadAntesDeImpuesto.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,}
                                ) - utilidadAntesDeImpuestoActualizado.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,})}
                              </Typography>
                            </div>
                          </div>
                        {Object.entries(zones).map(
                          ([zone, { total: zoneTotal, rubros }]) => (
                            <div key={zone}>
                              <h5>
                                <div style={uen == "Constructora"? informeStyles.uenConstructora: uen == "Inmobiliaria"? informeStyles.uenInmobiliaria: uen == "Unidades de Apoyo"? informeStyles.uenUA: informeStyles.uen}>
                                  <Typography sx={{ color: "white" }}>
                                    {zone}:
                                  </Typography>
                                  <Typography sx={{ color: "white" }}>
                                    {zoneTotal.toLocaleString("es-ES", {minimumFractionDigits: 0,maximumFractionDigits: 0,})}
                                  </Typography>
                                  <Typography sx={{ color: "white" }}>
                                    {zoneTotal.toLocaleString("es-ES", {minimumFractionDigits: 0,maximumFractionDigits: 0,})}
                                  </Typography>
                                </div>
                              </h5>
                                <div
                                  style={uen == "Constructora"? informeStyles.containerConstructora: uen == "Inmobiliaria"? informeStyles.containerInmobiliaria: uen == "Unidades de Apoyo"? informeStyles.containerUA: informeStyles.container}>
                                  <div style={informeStyles.textContent}>
                                    <Typography variant="caption"style={{ width: "25%" }}>
                                      Ingresos Operacionales:
                                    </Typography>
                                    <Typography variant="caption"style={{ width: "25%" }}>
                                      {totalsByZone[zone].zonaingresosOperacionalesTotal.toLocaleString("es-ES",{minimumFractionDigits: 0, maximumFractionDigits: 0,})}
                                    </Typography>
                                    <Typography variant="caption"style={{ width: "25%" }}>
                                      {TotalsByZoneActualizado[zone].zonaingresosOperacionalesTotalActualizado.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,})}
                                    </Typography>
                                    <Typography variant="caption"style={{ width: "25%" }}>
                                      {totalsByZone[zone].zonaingresosOperacionalesTotal.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,}
                                      ) - TotalsByZoneActualizado[zone].zonaingresosOperacionalesTotalActualizado.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,})}
                                    </Typography>
                                  </div>
                                  <div style={informeStyles.textContent}>
                                    <Typography variant="caption"style={{ width: "25%" }}>
                                      Costos Indirectos:
                                    </Typography>
                                    <Typography variant="caption"style={{ width: "25%" }}>
                                      {totalsByZone[zone].zonacostosIndirectosTotal.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,})}
                                    </Typography>
                                    <Typography variant="caption"style={{ width: "25%" }}>
                                      {TotalsByZoneActualizado[zone].zonacostosIndirectosTotalActualizado.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,})}
                                    </Typography>
                                    <Typography variant="caption"style={{ width: "25%" }}>
                                      {totalsByZone[zone].zonacostosIndirectosTotal.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,}
                                      ) - TotalsByZoneActualizado[zone].zonacostosIndirectosTotalActualizado.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,})}
                                    </Typography>
                                  </div>
                                  <div style={informeStyles.textContent}>
                                    <Typography variant="caption"style={{ width: "25%" }}>
                                      Costos de Venta:
                                    </Typography>
                                    <Typography variant="caption"style={{ width: "25%" }}>
                                      {totalsByZone[zone].zonacostosDeVentaTotal.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,})}
                                    </Typography>
                                    <Typography variant="caption"style={{ width: "25%" }}>
                                      {TotalsByZoneActualizado[zone].zonacostosDeVentaTotalActualizado.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,})}
                                    </Typography>
                                    <Typography variant="caption"style={{ width: "25%" }}>
                                      {totalsByZone[zone].zonacostosDeVentaTotal.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,}
                                      ) - TotalsByZoneActualizado[zone].zonacostosDeVentaTotalActualizado.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,})}
                                    </Typography>
                                  </div>
                                  <div
                                    style={uen == "Constructora"? informeStyles.titleZuConstructora: uen == "Inmobiliaria"? informeStyles.titleZuInmobiliaria: uen == "Unidades de Apoyo"? informeStyles.titleZuUA: informeStyles.titleZu}>
                                    <Typography variant="caption"style={{ width: "25%" }}>
                                      Utilidad Bruta:
                                    </Typography>
                                    <Typography variant="caption"style={{ width: "25%" }}>
                                      {totalsByZone[zone].zonautilidadBruta.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,})}
                                    </Typography>
                                    <Typography variant="caption"style={{ width: "25%" }}>
                                      {TotalsByZoneActualizado[zone].zonautilidadBrutaActualizado.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,})}
                                    </Typography>
                                    <Typography variant="caption"style={{ width: "25%" }}>
                                      {totalsByZone[zone].zonautilidadBruta.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,}
                                      ) - TotalsByZoneActualizado[zone].zonautilidadBrutaActualizado.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,})}
                                    </Typography>
                                  </div>
                                  <div style={informeStyles.textContent}>
                                    <Typography variant="caption"style={{ width: "25%" }}>
                                      Gastos de Administración:
                                    </Typography>
                                    <Typography variant="caption"style={{ width: "25%" }}>
                                      {totalsByZone[zone].zonagastosOperacionalesAdministrativosTotal.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,})}
                                    </Typography>
                                    <Typography variant="caption"style={{ width: "25%" }}>
                                      {TotalsByZoneActualizado[zone].zonagastosOperacionalesAdministrativosTotalActualizado.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,})}
                                    </Typography>
                                    <Typography variant="caption"style={{ width: "25%" }}>
                                      {totalsByZone[zone].zonagastosOperacionalesAdministrativosTotal.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,}
                                      ) - TotalsByZoneActualizado[zone].zonagastosOperacionalesAdministrativosTotalActualizado.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,})}
                                    </Typography>
                                  </div>
                                  <div style={informeStyles.textContent}>
                                    <Typography variant="caption"style={{ width: "25%" }}>
                                      Gastos de Comercialización:
                                    </Typography>
                                    <Typography variant="caption"style={{ width: "25%" }}>
                                      {totalsByZone[zone].zonagastosOperacionalesComercialesTotal.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,})}
                                    </Typography>
                                    <Typography variant="caption"style={{ width: "25%" }}>
                                      {TotalsByZoneActualizado[zone].zonagastosOperacionalesComercialesTotalActualizado.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,})}
                                    </Typography>
                                    <Typography variant="caption"style={{ width: "25%" }}>
                                      {totalsByZone[zone].zonagastosOperacionalesComercialesTotal.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,}
                                      ) - TotalsByZoneActualizado[zone].zonagastosOperacionalesComercialesTotalActualizado.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,})}
                                    </Typography>
                                  </div>
                                  <div
                                    style={uen == "Constructora"? informeStyles.titleZuConstructora: uen == "Inmobiliaria"? informeStyles.titleZuInmobiliaria: uen == "Unidades de Apoyo"? informeStyles.titleZuUA: informeStyles.titleZu}>
                                    <Typography variant="caption"style={{ width: "25%" }}>
                                      Utilidad ó (PERDIDA) Operacional:
                                    </Typography>
                                    <Typography variant="caption"style={{ width: "25%" }}>
                                      {totalsByZone[zone].zonautilidadPerdidaOperacional.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,})}
                                    </Typography>
                                    <Typography variant="caption"style={{ width: "25%" }}>
                                      {TotalsByZoneActualizado[zone].zonautilidadPerdidaOperacionalActualizado.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,})}
                                    </Typography>
                                    <Typography variant="caption"style={{ width: "25%" }}>
                                      {totalsByZone[zone].zonautilidadPerdidaOperacional.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,}
                                      ) - TotalsByZoneActualizado[zone].zonautilidadPerdidaOperacionalActualizado.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,})}
                                    </Typography>
                                  </div>
                                  <div style={informeStyles.textContent}>
                                    <Typography variant="caption"style={{ width: "25%" }}>
                                      Ingresos No Operacionales:
                                    </Typography>
                                    <Typography variant="caption"style={{ width: "25%" }}>
                                      {totalsByZone[zone].zonaingresosNoOperacionalesTotal.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,})}
                                    </Typography>
                                    <Typography variant="caption"style={{ width: "25%" }}>
                                      {TotalsByZoneActualizado[zone].zonaingresosNoOperacionalesTotalActualizado.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,})}
                                    </Typography>
                                    <Typography variant="caption"style={{ width: "25%" }}>
                                      {totalsByZone[zone].zonaingresosNoOperacionalesTotal.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,}
                                      ) - TotalsByZoneActualizado[zone].zonaingresosNoOperacionalesTotalActualizado.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,})}
                                    </Typography>
                                  </div>
                                  <div style={informeStyles.textContent}>
                                    <Typography variant="caption"style={{ width: "25%" }}>
                                      Gastos No Operacionales:
                                    </Typography>
                                    <Typography variant="caption"style={{ width: "25%" }}>
                                      {totalsByZone[zone].zonagastosNoOperacionalesTotal.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,})}
                                    </Typography>
                                    <Typography variant="caption"style={{ width: "25%" }}>
                                      {TotalsByZoneActualizado[zone].zonagastosNoOperacionalesTotalActualizado.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,})}
                                    </Typography>
                                    <Typography variant="caption"style={{ width: "25%" }}>
                                      {totalsByZone[zone].zonagastosNoOperacionalesTotal.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,}
                                      ) - TotalsByZoneActualizado[zone].zonagastosNoOperacionalesTotalActualizado.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,})}
                                    </Typography>
                                  </div>
                                  <div
                                    style={uen == "Constructora"? informeStyles.titleZuConstructora: uen == "Inmobiliaria"? informeStyles.titleZuInmobiliaria: uen == "Unidades de Apoyo"? informeStyles.titleZuUA: informeStyles.titleZu}>
                                    <Typography variant="caption"style={{ width: "25%" }}>
                                      Utilidad Antes De Impuesto:
                                    </Typography>
                                    <Typography variant="caption"style={{ width: "25%" }}>
                                      {totalsByZone[zone].zonautilidadAntesDeImpuesto.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,})}
                                    </Typography>
                                    <Typography variant="caption"style={{ width: "25%" }}>
                                      {TotalsByZoneActualizado[zone].zonautilidadAntesDeImpuestoActualizado.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,})}
                                    </Typography>
                                    <Typography variant="caption"style={{ width: "25%" }}>
                                      {totalsByZone[zone].zonautilidadAntesDeImpuesto.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,}
                                      ) - TotalsByZoneActualizado[zone].zonautilidadAntesDeImpuestoActualizado.toLocaleString("es-ES",{minimumFractionDigits: 0,maximumFractionDigits: 0,})}
                                    </Typography>
                                  </div>
                                </div>
                            </div>
                          )
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            </AccordionDetails>
          </Accordion>
        </div>
      );
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      <Sidebar />
      <div style={{ display: "flex", width: "100%", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            marginBottom: "10px",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          <FormGroup
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-end",
            }}
          >
          </FormGroup>
        </div>

        {loading ? (
          <p>
            <LoadingModal open={loading} />
          </p>
        ) : (
          renderData(data)
        )}
      </div>
    </div>
  );
};

export default Consolidado;
