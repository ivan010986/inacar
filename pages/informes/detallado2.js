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

const Detallado = () => {
  const [data, setData] = useState([]);
  const [updatedRubros, setUpdatedRubros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isTotalVisible, setIsTotalVisible] = useState(false);
  const [isUtilidadVisible, setIsUtilidadVisible] = useState(true);
  const [isRubroVisible, setIsRubroVisible] = useState(false);
  const [isSubrubroVisible, setIsSubrubroVisible] = useState(false);
  const [isAuxiliarVisible, setIsAuxiliarVisible] = useState(false);
  const [isCuentaVisible, setIsCuentaVisible] = useState(false);

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
      const totalPresupuestoMes = item.meses_presupuesto.reduce((total, mes) => {
        return total + parseFloat(mes.presupuestomes);
      }, 0);
      // Initialize data structure
      if (!organizedData[year]) organizedData[year] = {};
      if (!organizedData[year][uen]) organizedData[year][uen] = { total: 0, zones: {} };
      if (!organizedData[year][uen].zones[zone]) organizedData[year][uen].zones[zone] = { total: 0, rubros: {} };
      if (!organizedData[year][uen].zones[zone].rubros[rubroIndex]) {
        organizedData[year][uen].zones[zone].rubros[rubroIndex] = {
          total: 0,
          subrubros: {},
        };
      }
  
      if (!organizedData[year][uen].zones[zone].rubros[rubroIndex].subrubros[subrubroIndex]) {
        organizedData[year][uen].zones[zone].rubros[rubroIndex].subrubros[subrubroIndex] = {
          total: 0,
          auxiliares: {},
        };
      }
      if (!organizedData[year][uen].zones[zone].rubros[rubroIndex].subrubros[subrubroIndex].auxiliares[auxiliarIndex]) {
        organizedData[year][uen].zones[zone].rubros[rubroIndex].subrubros[subrubroIndex].auxiliares[auxiliarIndex] = {
          total: 0,
          cuentas: {},
        };
      }
  
      // Group by cuentaCodigo
      const cuentaAgrupada = organizedData[year][uen].zones[zone].rubros[rubroIndex].subrubros[subrubroIndex].auxiliares[auxiliarIndex].cuentas;
      if (!cuentaAgrupada[cuentaCodigo]) {
        cuentaAgrupada[cuentaCodigo] = {
          nombre: cuentaNombre,
          total: 0,
        };
      }
      cuentaAgrupada[cuentaCodigo].total += totalPresupuestoMes;

      // Update subrubro and auxiliar totals regardless of exclusion
      organizedData[year][uen].zones[zone].rubros[rubroIndex].subrubros[subrubroIndex].auxiliares[auxiliarIndex].total += totalPresupuestoMes;
      organizedData[year][uen].zones[zone].rubros[rubroIndex].subrubros[subrubroIndex].total += totalPresupuestoMes;

      if (rubroIndex === 3 && subrubroIndex === 16) {

      } else {
        // Agregar a los totales de rubro, zona y UEN si no es "HONORARIOS INTERNOS"
        organizedData[year][uen].zones[zone].rubros[rubroIndex].total += totalPresupuestoMes;
        organizedData[year][uen].zones[zone].total += totalPresupuestoMes;
        organizedData[year][uen].total += totalPresupuestoMes;
      }
    });
    console.log(organizedData);
    return organizedData;
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

        totalPages = Math.ceil(data.count / 2500); 
        page++; // Move to the next page
      } while (page <= totalPages);
      
      setUpdatedRubros(allData[0].updatedRubros);
      const organizedData = organizeData(allData);
      setData(organizedData);
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
      if (rubros) {
        Object.entries(rubros).forEach(([rubroIndex, rubroData]) => {
          const rubroName = updatedRubros[rubroIndex]?.nombre;
  
          // Validar que rubroData.total sea un número antes de sumarlo
          const total = rubroData?.total || 0;
  
          if (rubroName === "INGRESOS OPERACIONALES") {
            ingresosOperacionalesTotal += total;
          } else if (rubroName === "COSTOS INDIRECTOS") {
            costosIndirectosTotal += total;
          } else if (rubroName === "COSTOS DE VENTA") {
            costosDeVentaTotal += total;
          } else if (rubroName === "GASTOS OPERACIONALES DE ADMINISTRACION") {
            gastosOperacionalesAdministrativosTotal += total;
          } else if (rubroName === "GASTOS OPERACIONALES DE COMERCIALIZACION") {
            gastosOperacionalesComercialesTotal += total;
          } else if (rubroName === "INGRESOS NO OPERACIONALES") {
            ingresosNoOperacionalesTotal += total;
          } else if (rubroName === "GASTOS NO OPERACIONALES") {
            gastosNoOperacionalesTotal += total;
          }
        });
      }
    });
  
    const costosDeVentacostosIndirectosTotal =
       costosDeVentaTotal + costosIndirectosTotal;
    const utilidadBruta =
      ingresosOperacionalesTotal - costosDeVentaTotal - costosIndirectosTotal;
    const utilidadoPerdidaOperacional =
      utilidadBruta - gastosOperacionalesAdministrativosTotal - gastosOperacionalesComercialesTotal;
    const utilidadAntesDeImpuesto =
      utilidadoPerdidaOperacional + ingresosNoOperacionalesTotal - gastosNoOperacionalesTotal;
  
    return {
      costosDeVentacostosIndirectosTotal,
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
  
  const calculateTotalsByZone = (zones, updatedRubros) => {
    const totalsByZone = {};
  
    // Iterar por zonas y rubros para calcular los totales por zona
    Object.entries(zones).forEach(([zoneName, { rubros }]) => {
      // Inicializar objeto de totales para la zona si no existe
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
  
      // Verificar si rubros está definido
      if (rubros) {
        Object.entries(rubros).forEach(([rubroIndex, rubroData]) => {
          const rubroName = updatedRubros[rubroIndex]?.nombre;
  
          // Validar que rubroData.total sea un número antes de sumarlo
          const total = rubroData?.total || 0;
  
          if (rubroName === "INGRESOS OPERACIONALES") {
            totalsByZone[zoneName].zonaingresosOperacionalesTotal += total;
          } else if (rubroName === "COSTOS INDIRECTOS") {
            totalsByZone[zoneName].zonacostosIndirectosTotal += total;
          } else if (rubroName === "COSTOS DE VENTA") {
            totalsByZone[zoneName].zonacostosDeVentaTotal += total;
          } else if (rubroName === "GASTOS OPERACIONALES DE ADMINISTRACION") {
            totalsByZone[zoneName].zonagastosOperacionalesAdministrativosTotal += total;
          } else if (rubroName === "GASTOS OPERACIONALES DE COMERCIALIZACION") {
            totalsByZone[zoneName].zonagastosOperacionalesComercialesTotal += total;
          } else if (rubroName === "INGRESOS NO OPERACIONALES") {
            totalsByZone[zoneName].zonaingresosNoOperacionalesTotal += total;
          } else if (rubroName === "GASTOS NO OPERACIONALES") {
            totalsByZone[zoneName].zonagastosNoOperacionalesTotal += total;
          }
        });
      }
  
      // Calcular utilidad bruta y operativa para la zona
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
      const apoyoTotals = calculateTotals(uens["Unidades de Apoyo"]?.zones || {});

      // Split the total of "Unidades de Apoyo" (40% Constructora, 40% Promotora, 20% Inmobiliaria)
      const apoyoConstructoraShare = apoyoTotal * 0.4;
      const apoyoPromotoraShare = apoyoTotal * 0.5;
      const apoyoInmobiliariaShare = apoyoTotal * 0.1;

      // Split the main "Unidades de Apoyo" totals by 40%, 40%, and 20%
      const apoyoShareConstructora = {
          ingresosOperacionalesTotal: apoyoTotals.ingresosOperacionalesTotal * 0.4,
          costosIndirectosTotal: apoyoTotals.costosIndirectosTotal * 0.4,
          costosDeVentaTotal: apoyoTotals.costosDeVentaTotal * 0.4,
          utilidadBruta: apoyoTotals.utilidadBruta * 0.4,
          gastosOperacionalesAdministrativosTotal: apoyoTotals.gastosOperacionalesAdministrativosTotal * 0.4,
          gastosOperacionalesComercialesTotal: apoyoTotals.gastosOperacionalesComercialesTotal * 0.4,
          ingresosNoOperacionalesTotal: apoyoTotals.ingresosNoOperacionalesTotal * 0.4,
          gastosNoOperacionalesTotal: apoyoTotals.gastosNoOperacionalesTotal * 0.4,
          utilidadAntesDeImpuesto: apoyoTotals.utilidadAntesDeImpuesto * 0.4,
          utilidadoPerdidaOperacional: apoyoTotals.utilidadoPerdidaOperacional * 0.4,
      };

      const apoyoSharePromotora = {
          ingresosOperacionalesTotal: apoyoTotals.ingresosOperacionalesTotal * 0.5,
          costosDeVentacostosIndirectosTotal: apoyoTotals.costosDeVentacostosIndirectosTotal * 0.5,
          costosIndirectosTotal: apoyoTotals.costosIndirectosTotal * 0.5,
          costosDeVentaTotal: apoyoTotals.costosDeVentaTotal * 0.5,
          utilidadBruta: apoyoTotals.utilidadBruta * 0.5,
          gastosOperacionalesAdministrativosTotal: apoyoTotals.gastosOperacionalesAdministrativosTotal * 0.5,
          gastosOperacionalesComercialesTotal: apoyoTotals.gastosOperacionalesComercialesTotal * 0.5,
          ingresosNoOperacionalesTotal: apoyoTotals.ingresosNoOperacionalesTotal * 0.5,
          gastosNoOperacionalesTotal: apoyoTotals.gastosNoOperacionalesTotal * 0.5,
          utilidadAntesDeImpuesto: apoyoTotals.utilidadAntesDeImpuesto * 0.5,
          utilidadoPerdidaOperacional: apoyoTotals.utilidadoPerdidaOperacional * 0.5,
      };

      const apoyoShareInmobiliaria = {
          ingresosOperacionalesTotal: apoyoTotals.ingresosOperacionalesTotal * 0.1,
          costosIndirectosTotal: apoyoTotals.costosIndirectosTotal * 0.1,
          costosDeVentaTotal: apoyoTotals.costosDeVentaTotal * 0.1,
          utilidadBruta: apoyoTotals.utilidadBruta * 0.1,
          gastosOperacionalesAdministrativosTotal: apoyoTotals.gastosOperacionalesAdministrativosTotal * 0.1,
          gastosOperacionalesComercialesTotal: apoyoTotals.gastosOperacionalesComercialesTotal * 0.1,
          ingresosNoOperacionalesTotal: apoyoTotals.ingresosNoOperacionalesTotal * 0.1,
          gastosNoOperacionalesTotal: apoyoTotals.gastosNoOperacionalesTotal * 0.1,
          utilidadAntesDeImpuesto: apoyoTotals.utilidadAntesDeImpuesto * 0.1,
          utilidadoPerdidaOperacional: apoyoTotals.utilidadoPerdidaOperacional * 0.1,
      };

      return (
        <div key={year} > 
          <Accordion key={year} sx={{ marginBottom: "20px"}} >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color:'white' }} />}
              aria-controls={`panel-${year}-content`}
              id={`panel-${year}-header`}
              sx={{ background:'#a6a2a2' }}
            >
              <Typography sx={{color:'white'}}>INFORME DETALLADO DE RESULTADOS {year}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <div
                style={{ display: "flex", flexWrap: "wrap", overflow: "auto" }}
              >
                {Object.entries(uens).map(([uen, { total: uenTotal, zones }]) => {

                  // Calculate individual shares for other values from Unidades de Apoyo
                  let adjustedTotal = uenTotal;               

                  // Adjust the totals for Constructora, Promotora, and Inmobiliaria
                  if (uen === "Constructora") {
                      adjustedTotal += apoyoConstructoraShare;
                  } else if (uen === "Promotora") {
                      adjustedTotal += apoyoPromotoraShare;
                  } else if (uen === "Inmobiliaria") {
                      adjustedTotal += apoyoInmobiliariaShare;
                  }
                  console.log(zones)
                  // Calculate main totals for this UEN's zones
                  const uenTotals = calculateTotals(zones);

                  // Initialize adjusted totals with the calculated values
                  let adjustedTotals = { ...uenTotals };

                  // Distribute "Unidades de Apoyo" totals to each UEN
                  if (uen === "Constructora") {
                      Object.keys(adjustedTotals).forEach(key => {
                          adjustedTotals[key] += apoyoShareConstructora[key];
                      });
                  } else if (uen === "Promotora") {
                      Object.keys(adjustedTotals).forEach(key => {
                          adjustedTotals[key] += apoyoSharePromotora[key];
                      });
                  } else if (uen === "Inmobiliaria") {
                      Object.keys(adjustedTotals).forEach(key => {
                          adjustedTotals[key] += apoyoShareInmobiliaria[key];
                      });
                  }

                  // Calculate and adjust totals for each zone in this UEN
                  const totalsByZone = calculateTotalsByZone(zones, updatedRubros);

                  return (
                    <div key={uen} style={{ flex: "1 1 20%", margin: "0.2px" }}>
                      <h4>
                        <div
                          style={
                            uen == "Constructora"
                              ? informeStyles.uenConstructora
                              : uen == "Inmobiliaria"
                              ? informeStyles.uenInmobiliaria
                              : uen == "Unidades de Apoyo"
                              ? informeStyles.uenUA
                              : informeStyles.uen
                          }
                        >
                          <Typography sx={{ color: "white" }}>{uen}:</Typography>
                          {isTotalVisible && (
                            <Typography sx={{ color: "white" }}>
                              
                              {adjustedTotal.toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </Typography>
                          )}
                        </div>
                      </h4>
                      {isUtilidadVisible && (
                        <div
                          style={
                            uen == "Constructora"
                              ? informeStyles.containerConstructora
                              : uen == "Inmobiliaria"
                              ? informeStyles.containerInmobiliaria
                              : uen == "Unidades de Apoyo"
                              ? informeStyles.containerUA
                              : informeStyles.container
                          }
                        >
                          <div style={informeStyles.textContent}>
                            <Typography variant="caption">
                              Ingresos Operacionales:
                            </Typography>
                            <Typography variant="caption">
                              {adjustedTotals.ingresosOperacionalesTotal.toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </Typography>
                          </div>
                          <div style={informeStyles.textContent}>
                            <Typography variant="caption">Costos Indirectos:</Typography>
                            <Typography variant="caption">
                              {adjustedTotals.costosIndirectosTotal.toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </Typography>
                          </div>
                          <div style={informeStyles.textContent}>
                            <Typography variant="caption">Costos de Venta:</Typography>
                            <Typography variant="caption">
                              {adjustedTotals.costosDeVentaTotal.toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </Typography>
                          </div>
                          <div  style={
                                  uen == "Constructora"
                                    ? informeStyles.titleZuConstructora
                                    : uen == "Inmobiliaria"
                                    ? informeStyles.titleZuInmobiliaria
                                    : uen == "Unidades de Apoyo"
                                    ? informeStyles.titleZuUA
                                    : informeStyles.titleZu
                                }>
                            <Typography variant="caption">
                              Utilidad Bruta:
                            </Typography>
                            <Typography variant="caption">
                              {adjustedTotals.utilidadBruta.toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </Typography>
                          </div>
                          <div style={informeStyles.textContent}>
                            <Typography variant="caption">
                              Gastos de Administración:
                            </Typography>
                            <Typography variant="caption">
                              {adjustedTotals.gastosOperacionalesAdministrativosTotal.toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </Typography>
                          </div>
                          <div style={informeStyles.textContent}>
                            <Typography variant="caption">
                              Gastos de Comercialización:
                            </Typography>
                            <Typography variant="caption">
                              {adjustedTotals.gastosOperacionalesComercialesTotal.toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </Typography>
                          </div>
                          <div  style={
                                  uen == "Constructora"
                                    ? informeStyles.titleZuConstructora
                                    : uen == "Inmobiliaria"
                                    ? informeStyles.titleZuInmobiliaria
                                    : uen == "Unidades de Apoyo"
                                    ? informeStyles.titleZuUA
                                    : informeStyles.titleZu
                                }>
                            <Typography variant="caption">
                              Utilidad ó (PERDIDA) Operacional:
                            </Typography>
                            <Typography variant="caption">
                              {adjustedTotals.utilidadoPerdidaOperacional.toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </Typography>
                          </div>
                          <div style={informeStyles.textContent}>
                            <Typography variant="caption">
                              Ingresos No Operacionales:
                            </Typography>
                            <Typography variant="caption">
                              {adjustedTotals.ingresosNoOperacionalesTotal.toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </Typography>
                          </div>
                          <div style={informeStyles.textContent}>
                            <Typography variant="caption">
                              Gastos No Operacionales:
                            </Typography>
                            <Typography variant="caption">
                              {adjustedTotals.gastosNoOperacionalesTotal.toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </Typography>
                          </div>
                          <div  style={
                                  uen == "Constructora"
                                    ? informeStyles.titleZuConstructora
                                    : uen == "Inmobiliaria"
                                    ? informeStyles.titleZuInmobiliaria
                                    : uen == "Unidades de Apoyo"
                                    ? informeStyles.titleZuUA
                                    : informeStyles.titleZu
                                }>
                            <Typography variant="caption" >
                              Utilidad Antes De Impuesto:
                            </Typography>
                            <Typography variant="caption">
                              {adjustedTotals.utilidadAntesDeImpuesto.toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </Typography>
                          </div>
                        </div>
                      )}
                      {Object.entries(zones).map(
                        ([zone, { total: zoneTotal, rubros }]) => (
                          <div key={zone}>
                            <h5>
                              <div
                              style={
                                uen == "Constructora"
                                  ? informeStyles.uenConstructora
                                  : uen == "Inmobiliaria"
                                  ? informeStyles.uenInmobiliaria
                                  : uen == "Unidades de Apoyo"
                                  ? informeStyles.uenUA
                                  : informeStyles.uen
                              }
                              >
                                <Typography sx={{color:'white'}}> {zone}:</Typography>
                                {isTotalVisible && (
                                  <Typography sx={{color:'white'}}> {zoneTotal.toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</Typography>
                                )}
                              </div>
                            </h5>
                            {isUtilidadVisible && (
                              <div
                                style={
                                  uen == "Constructora"
                                    ? informeStyles.containerConstructora
                                    : uen == "Inmobiliaria"
                                    ? informeStyles.containerInmobiliaria
                                    : uen == "Unidades de Apoyo"
                                    ? informeStyles.containerUA
                                    : informeStyles.container
                                }
                              >
                                <div style={informeStyles.textContent}>
                                  <Typography variant="caption">
                                    Ingresos Operacionales:
                                  </Typography>
                                  <Typography variant="caption">
                                    {totalsByZone[
                                      zone
                                    ].zonaingresosOperacionalesTotal.toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                  </Typography>
                                </div>
                                <div style={informeStyles.textContent}>
                                  <Typography variant="caption">
                                    Costos Indirectos:
                                  </Typography>
                                  <Typography variant="caption">
                                    {totalsByZone[
                                      zone
                                    ].zonacostosIndirectosTotal.toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                  </Typography>
                                </div>
                                <div style={informeStyles.textContent}>
                                  <Typography variant="caption">
                                    Costos de Venta:
                                  </Typography>
                                  <Typography variant="caption">
                                    {totalsByZone[
                                      zone
                                    ].zonacostosDeVentaTotal.toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                  </Typography>
                                </div>
                                <div style={
                                  uen == "Constructora"
                                    ? informeStyles.titleZuConstructora
                                    : uen == "Inmobiliaria"
                                    ? informeStyles.titleZuInmobiliaria
                                    : uen == "Unidades de Apoyo"
                                    ? informeStyles.titleZuUA
                                    : informeStyles.titleZu
                                }>
                                  <Typography variant="caption" >
                                    Utilidad Bruta:
                                  </Typography>
                                  <Typography variant="caption">
                                    {totalsByZone[zone].zonautilidadBruta.toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                  </Typography>
                                </div>
                                <div style={informeStyles.textContent}>
                                  <Typography variant="caption">
                                    Gastos de Administración:
                                  </Typography>
                                  <Typography variant="caption">
                                    {totalsByZone[
                                      zone
                                    ].zonagastosOperacionalesAdministrativosTotal.toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                  </Typography>
                                </div>
                                <div style={informeStyles.textContent}>
                                  <Typography variant="caption">
                                    Gastos de Comercialización:
                                  </Typography>
                                  <Typography variant="caption">
                                    {totalsByZone[
                                      zone
                                    ].zonagastosOperacionalesComercialesTotal.toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                  </Typography>
                                </div>
                                <div style={
                                  uen == "Constructora"
                                    ? informeStyles.titleZuConstructora
                                    : uen == "Inmobiliaria"
                                    ? informeStyles.titleZuInmobiliaria
                                    : uen == "Unidades de Apoyo"
                                    ? informeStyles.titleZuUA
                                    : informeStyles.titleZu
                                }>
                                  <Typography variant="caption">
                                    Utilidad ó (PERDIDA) Operacional:
                                  </Typography>
                                  <Typography variant="caption">
                                    {totalsByZone[
                                      zone
                                    ].zonautilidadPerdidaOperacional.toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                  </Typography>
                                </div>
                                <div style={informeStyles.textContent}>
                                  <Typography variant="caption">
                                    Ingresos No Operacionales:
                                  </Typography>
                                  <Typography variant="caption">
                                    {totalsByZone[
                                      zone
                                    ].zonaingresosNoOperacionalesTotal.toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                  </Typography>
                                </div>
                                <div style={informeStyles.textContent}>
                                  <Typography variant="caption">
                                    Gastos No Operacionales:
                                  </Typography>
                                  <Typography variant="caption">
                                    {totalsByZone[
                                      zone
                                    ].zonagastosNoOperacionalesTotal.toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                  </Typography>
                                </div>
                                <div style={
                                  uen == "Constructora"
                                    ? informeStyles.titleZuConstructora
                                    : uen == "Inmobiliaria"
                                    ? informeStyles.titleZuInmobiliaria
                                    : uen == "Unidades de Apoyo"
                                    ? informeStyles.titleZuUA
                                    : informeStyles.titleZu
                                }>
                                  <Typography variant="caption">
                                    Utilidad Antes De Impuesto:
                                  </Typography>
                                  <Typography variant="caption">
                                    {totalsByZone[
                                      zone
                                    ].zonautilidadAntesDeImpuesto.toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                  </Typography>
                                </div>
                              </div>
                            )}
                            {isRubroVisible && (
                              <div>
                                {Object.entries(rubros).map(
                                  ([rubroIndex, { total, subrubros }]) => {
                                    const rubro = updatedRubros[rubroIndex];
                                    return (
                                      <div
                                        style={{ margin: "10px" }}
                                        key={rubroIndex}
                                      >
                                        <div
                                          style={
                                            uen == "Constructora"
                                              ? informeStyles.containerRConstructora
                                              : uen == "Inmobiliaria"
                                              ? informeStyles.containerRInmobiliaria
                                              : uen ==
                                                "Unidades de Apoyo"
                                              ? informeStyles.containerRUA
                                              : informeStyles.containerR
                                          }
                                        >
                                          <Typography variant="caption" fontWeight='bold'>
                                            {rubro
                                              ? rubro.nombre
                                              : "Rubro no encontrado"}
                                            :
                                          </Typography>

                                          {isTotalVisible && (
                                            <Typography variant="caption">
                                              {total.toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                            </Typography>
                                          )}
                                        </div>
                                        {isSubrubroVisible && (
                                          <div>
                                            {Object.entries(subrubros).map(
                                              ([
                                                subrubroIndex,
                                                {
                                                  total: subrubroTotal,
                                                  auxiliares,
                                                },
                                              ]) => {
                                                const subrubro =
                                                  rubro.subrubros[subrubroIndex];
                                                return (
                                                  <div key={subrubroIndex}>
                                                    <div
                                                        style={
                                                          uen == "Constructora"
                                                            ? informeStyles.containerSRConstructora
                                                            : uen == "Inmobiliaria"
                                                            ? informeStyles.containerSRInmobiliaria
                                                            : uen ==
                                                              "Unidades de Apoyo"
                                                            ? informeStyles.containerSRUA
                                                            : informeStyles.containerSR
                                                        }
                                                    >
                                                      <Typography variant="caption">
                                                        {subrubro
                                                          ? subrubro.nombre
                                                          : "Subrubro no encontrado"}
                                                        :
                                                      </Typography>
                                                      {isTotalVisible && (
                                                        <Typography variant="caption">
                                                          {subrubroTotal.toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                                        </Typography>
                                                      )}
                                                    </div>
                                                    {isAuxiliarVisible && (
                                                      <div>
                                                        {Object.entries(
                                                          auxiliares
                                                        ).map(
                                                          ([
                                                            auxIndex,
                                                            {
                                                              total: auxTotal,
                                                              cuentas,
                                                            },
                                                          ]) => {
                                                            const auxiliar =
                                                              subrubro.auxiliares[
                                                                auxIndex
                                                              ];
                                                            return (
                                                              <div key={auxIndex}>
                                                                <div
                                                                  style={
                                                                    uen == "Constructora"
                                                                      ? informeStyles.containerAConstructora
                                                                      : uen == "Inmobiliaria"
                                                                      ? informeStyles.containerAInmobiliaria
                                                                      : uen ==
                                                                        "Unidades de Apoyo"
                                                                      ? informeStyles.containerAUA
                                                                      : informeStyles.containerA
                                                                  }
                                                                >
                                                                  <Typography variant="caption">
                                                                    {auxiliar
                                                                      ? auxiliar.nombre
                                                                      : "Auxiliar no encontrado"}
                                                                    :
                                                                  </Typography>
                                                                  {isTotalVisible && (
                                                                    <Typography variant="caption">
                                                                      {auxTotal.toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                                                    </Typography>
                                                                  )}
                                                                </div>
                                                                {isCuentaVisible && (
                                                                  <div>
                                                                    {Object.entries(
                                                                      cuentas
                                                                    ).map(
                                                                      ([
                                                                        codigo,
                                                                        {
                                                                          nombre,
                                                                          total,
                                                                        },
                                                                      ]) => (
                                                                        <div
                                                                          style={
                                                                            uen ==
                                                                            "Constructora"
                                                                              ? informeStyles.containerCCConstructora
                                                                              : uen ==
                                                                                "Inmobiliaria"
                                                                              ? informeStyles.containerCCInmobiliaria
                                                                              : uen ==
                                                                                "Unidades de Apoyo"
                                                                              ? informeStyles.containerCCUA
                                                                              : informeStyles.containerCC
                                                                          }
                                                                        >
                                                                          <Typography variant="caption">
                                                                            {
                                                                              codigo
                                                                            }
                                                                            {
                                                                              nombre
                                                                            }
                                                                            :
                                                                          </Typography>
                                                                          {isTotalVisible && (
                                                                            <Typography variant="caption">
                                                                              {total.toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                                                            </Typography>
                                                                          )}
                                                                        </div>
                                                                      )
                                                                    )}
                                                                  </div>
                                                                )}
                                                              </div>
                                                            );
                                                          }
                                                        )}
                                                      </div>
                                                    )}
                                                  </div>
                                                );
                                              }
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  }
                                )}
                              </div>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  );
                })}
              </div>
            </AccordionDetails>
          </Accordion>
        </div>
      );
    });
  };

  const exportToExcel = () => {
    const formattedData = [];
  
    // Organize the data for each UEN and its detailed structure
    Object.entries(data).forEach(([year, uens]) => {
      Object.entries(uens).forEach(([uen, { total: uenTotal, zones }]) => {
        // Variables to keep track of the current year and UEN for each row
        let currentYear = year;
        let currentUEN = uen;
  
        // Add a row for the UEN summary
        formattedData.push({ 
          Año: currentYear, 
          UEN: currentUEN, 
          Zona: "", 
          Rubro: "", 
          Subrubro: "", 
          Auxiliar: "", 
          "Centro Costos": "", 
          Totales: uenTotal 
        });
  
        Object.entries(zones).forEach(([zone, { total: zoneTotal, rubros }]) => {
          let currentZone = zone;
  
          // Add a row for each zone within the UEN
          formattedData.push({ 
            Año: currentYear,
            UEN: currentUEN, 
            Zona: currentZone, 
            Rubro: "", 
            Subrubro: "", 
            Auxiliar: "", 
            "Centro Costos": "", 
            Totales: zoneTotal 
          });
  
          Object.entries(rubros).forEach(([rubroIndex, rubroData]) => {
            const rubroName = updatedRubros[rubroIndex]?.nombre;
            let currentRubro = rubroName;
  
            // Add a row for each rubro within the zone
            formattedData.push({ 
              Año: currentYear,
              UEN: currentUEN, 
              Zona: currentZone, 
              Rubro: currentRubro, 
              Subrubro: "", 
              Auxiliar: "", 
              "Centro Costos": "", 
              Totales: rubroData.total 
            });
  
            Object.entries(rubroData.subrubros).forEach(([subrubroIndex, subrubroData]) => {
              const subrubroName = updatedRubros[rubroIndex]?.subrubros?.[subrubroIndex]?.nombre;
              let currentSubrubro = subrubroName;
  
              // Add a row for each subrubro within the rubro
              formattedData.push({ 
                Año: currentYear,
                UEN: currentUEN, 
                Zona: currentZone, 
                Rubro: currentRubro, 
                Subrubro: currentSubrubro, 
                Auxiliar: "", 
                "Centro Costos": "", 
                Totales: subrubroData.total 
              });
  
              Object.entries(subrubroData.auxiliares).forEach(([auxiliarIndex, auxiliarData]) => {
                const auxiliarName = updatedRubros[rubroIndex]?.subrubros?.[subrubroIndex]?.auxiliares?.[auxiliarIndex]?.nombre;
                let currentAuxiliar = auxiliarName;
  
                // Add a row for each auxiliar within the subrubro
                formattedData.push({ 
                  Año: currentYear,
                  UEN: currentUEN, 
                  Zona: currentZone, 
                  Rubro: currentRubro, 
                  Subrubro: currentSubrubro, 
                  Auxiliar: currentAuxiliar, 
                  "Centro Costos": "", 
                  Totales: auxiliarData.total 
                });
  
                Object.entries(auxiliarData.cuentas).forEach(([cuentaCodigo, cuentaData]) => {
                  // Add a row for each cuenta within the auxiliar
                  formattedData.push({
                    Año: currentYear,
                    UEN: currentUEN,
                    Zona: currentZone,
                    Rubro: currentRubro,
                    Subrubro: currentSubrubro,
                    Auxiliar: currentAuxiliar,
                    "Centro Costos": cuentaCodigo + ' ' + cuentaData.nombre,
                    Totales: cuentaData.total
                  });
                });
              });
            });
          });
        });
  
        // Add an empty row after each UEN for separation in Excel
        formattedData.push({});
      });
    });
  
    // Create a new workbook and add the data
    const worksheet = XLSX.utils.json_to_sheet(formattedData, { header: ["Año", "UEN", "Zona", "Rubro", "Subrubro", "Auxiliar", "Centro Costos", "Totales"] });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Informe Detallado");
  
    // Export to Excel
    XLSX.writeFile(workbook, `Informe_Detallado_${new Date().getFullYear()}.xlsx`);
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
           <FormGroup sx={{ display: "flex", flexDirection: "row", justifyContent: "flex-end" }}>
           
            <FormControlLabel
              key="total" // Unique key
              control={
                <Checkbox
                  checked={isTotalVisible}
                  onChange={handleTotalToggle}
                  color="primary"
                  style={{ marginLeft: "10px" }}
                />
              }
              label="Ver Totales"
            />
            <FormControlLabel
              key="utilidad" // Unique key
              control={
                <Checkbox
                  checked={isUtilidadVisible}
                  onChange={handleUtilidadToggle}
                  color="primary"
                  style={{ marginLeft: "10px" }}
                />
              }
              label="Ver Proyecciones De Estados"
            />
            <FormControlLabel
              key="rubro" // Unique key
              control={
                <Checkbox
                  checked={isRubroVisible}
                  onChange={() => setIsRubroVisible(!isRubroVisible)}
                  color="primary"
                  style={{ marginLeft: "10px" }}
                />
              }
              label="Ver Rubros"
            />
            <FormControlLabel
              key="subrubro" // Unique key
              control={
                <Checkbox
                  checked={isSubrubroVisible}
                  onChange={() => setIsSubrubroVisible(!isSubrubroVisible)}
                  color="primary"
                  style={{ marginLeft: "10px" }}
                />
              }
              label="Ver Subrubros"
            />
            <FormControlLabel
              key="auxiliar" // Unique key
              control={
                <Checkbox
                  checked={isAuxiliarVisible}
                  onChange={() => setIsAuxiliarVisible(!isAuxiliarVisible)}
                  color="primary"
                  style={{ marginLeft: "10px" }}
                />
              }
              label="Ver Auxiliares"
            />
            <FormControlLabel
              key="cuenta" // Unique key
              control={
                <Checkbox
                  checked={isCuentaVisible}
                  onChange={() => setIsCuentaVisible(!isCuentaVisible)}
                  color="primary"
                  style={{ marginLeft: "10px" }}
                />
              }
              label="Ver Cuentas"
            />
            <Button variant="contained" color="success" onClick={exportToExcel}>
          Exportar a Excel
        </Button>
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

export default Detallado;
