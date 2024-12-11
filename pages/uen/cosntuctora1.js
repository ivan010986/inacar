import { useEffect, useState, useRef } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { Accordion, Autocomplete, SpeedDial, Button, Dialog, DialogTitle, AccordionSummary, DialogActions, DialogContent, TextField, Typography, useMediaQuery, SpeedDialAction } from '@mui/material';
import HoverButton from './hoverButton';
import styles from '../styles/table';
import { getCookie } from '../utils/cookieUtils';
import { Snackbar, Alert } from '@mui/material';
import * as XLSX from 'xlsx';
import { useRouter } from 'next/router';

const CustomTable = ({
  MONTHS, rubrosTotals, setRubrosTotals, setInputValues, inputValues, updatedRubros, setUpdatedRubros, uen,
  setMonthlyTotals, monthlyTotals, updatedcentroCostos, userId, CentroCostoid, setCentroCostoid

}) => {
  const [open, setOpen] = useState(false);
  const [selectedRubro, setSelectedRubro] = useState('');
  const [selectedSubrubro, setSelectedSubrubro] = useState('');
  const [newItem, setNewItem] = useState('');
  const [isAccepted, setIsAccepted] = useState(false);
  const [opacity, setOpacity] = useState(0.5);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [isUsed, setIsUsed] = useState(false);
  const isSmallScreen = useMediaQuery('(max-width:600px)');
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const fileInputRef = useRef(null);
  const router = useRouter();

  const handleMouseLeave = () => {
    setOpacity(0.5);
  };
  const handleMouseEnter = () => {
    setOpacity(1);
  };
  const currentView = router.pathname.split('/')[2];

  useEffect(() => {
    const debounceSave = setTimeout(() => {
      const savedData = {
        updatedRubros,
        monthlyTotals,
        rubrosTotals,
        inputs: inputValues,
      };
      localStorage.setItem(`${currentView}_rubrosData`, JSON.stringify(savedData));
    }, 500);

    return () => clearTimeout(debounceSave);
  }, [currentView, updatedRubros, monthlyTotals, rubrosTotals, inputValues]);

  const handleInputChange = (value, monthIndex, rubroName, inputId) => {
    const numericValue = parseFloat(value) || 0;
    const previousValue = inputValues[inputId]?.value || 0;
    const difference = numericValue - previousValue;
    localStorage.removeItem(`${currentView}_selectedPresupuesto`);
    setInputValues((prevInputValues) => ({
      ...prevInputValues,
      [inputId]: {
        value: numericValue,
        centroCostoid: CentroCostoid || localStorage.getItem(`${currentView}_CentroCostoid`),
        id: prevInputValues[inputId]?.id || parseInt(inputId.split('-')[3]),
      },
    }));

    // Cargando monthly and rubro totales
    setMonthlyTotals((prevTotals) => {
      const newTotals = [...prevTotals];
      newTotals[monthIndex] = (newTotals[monthIndex] || 0) + difference;
      return newTotals;
    });

    setRubrosTotals((prevRubrosTotals) => {
      const updatedTotals = { ...prevRubrosTotals };
      if (!updatedTotals[rubroName]) {
        updatedTotals[rubroName] = Array(12).fill(0);
      }
      updatedTotals[rubroName][monthIndex] = (updatedTotals[rubroName][monthIndex] || 0) + difference;
      return updatedTotals;
    });
  };

  const handleAddItem = () => {
    // Verifica que los valores seleccionados de Rubro, Subrubro y Centro de Costos existan
    if (!selectedRubro || !selectedSubrubro || !newItem || !CentroCostoid) {
      console.error("Faltan valores requeridos: Rubro, Subrubro o Centro de Costos");
      return;
    }

    // Encuentra el índice del rubro seleccionado
    const rubroIndex = updatedRubros.findIndex((r) => r.nombre === selectedRubro);

    if (rubroIndex !== -1) {
      // Verifica que los subrubros del rubro existan
      if (!Array.isArray(updatedRubros[rubroIndex].subrubros)) {
        updatedRubros[rubroIndex].subrubros = [];
      }

      // Encuentra el índice del subrubro seleccionado
      const subrubroIndex = updatedRubros[rubroIndex].subrubros.findIndex(
        (s) => `${s.codigo} ${s.nombre}` === selectedSubrubro
      );

      if (subrubroIndex !== -1 && newItem.trim() !== '') {
        // Realiza una copia del estado de los rubros
        const updatedSubrubros = [...updatedRubros];

        // Verifica que los ítems del subrubro existan
        if (!Array.isArray(updatedSubrubros[rubroIndex].subrubros[subrubroIndex].items)) {
          updatedSubrubros[rubroIndex].subrubros[subrubroIndex].items = [];
        }

        // Añade el nuevo ítem al subrubro
        updatedSubrubros[rubroIndex].subrubros[subrubroIndex].items.push({
          nombre: newItem,
          centroCostoid: CentroCostoid
        });

        // Actualiza el estado con los rubros modificados
        setUpdatedRubros(updatedSubrubros);
        setNewItem('');  // Resetea el campo de nuevo ítem
      } else {
        console.error("Subrubro no encontrado o valor inválido");
      }
    } else {
      console.error("Rubro no encontrado");
    }

    // Cierra el diálogo y marca como aceptado
    setIsAccepted(true);
    setOpen(false);
  };

  const handleRemoveItem = async (rubroIndex, subrubroIndex, itemIndex) => {
    const updatedRubrosCopy = [...updatedRubros];

    updatedRubrosCopy[rubroIndex].subrubros[subrubroIndex].items.splice(itemIndex, 1);

    const updatedInputValues = { ...inputValues };
    Object.keys(updatedInputValues).forEach((key) => {
      const [prefix, basic, rIndex, sIndex, iIndex] = key.split('-');
      if (
        parseInt(rIndex) === rubroIndex &&
        parseInt(sIndex) === subrubroIndex &&
        parseInt(iIndex) === itemIndex
      ) {
        delete updatedInputValues[key];
      }
    });

    const newMonthlyTotals = [...monthlyTotals];
    const newRubrosTotals = { ...rubrosTotals };

    MONTHS.forEach((_, monthIndex) => {
      const inputId = `outlined-basic-${rubroIndex}-${subrubroIndex}-${itemIndex}-${monthIndex}`;
      const value = parseFloat(inputValues[inputId]?.value) || 0;
      newMonthlyTotals[monthIndex] -= value;

      if (newRubrosTotals[updatedRubrosCopy[rubroIndex].nombre]) {
        newRubrosTotals[updatedRubrosCopy[rubroIndex].nombre][monthIndex] -= value;
      }
    });

    if (newRubrosTotals[updatedRubrosCopy[rubroIndex].nombre] &&
      newRubrosTotals[updatedRubrosCopy[rubroIndex].nombre].every(val => val === 0)) {
      delete newRubrosTotals[updatedRubrosCopy[rubroIndex].nombre];
    }

    const data = Object.keys(inputValues).map(inputId => {
      const inputValue = inputValues[inputId];
      return {
        id: parseInt(inputValue.id),
      };
    });
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const csrftoken = getCookie('csrftoken');
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/presupuestos/batch-delete/`, {
      method: 'DELETE',
      headers: {
        'X-CSRFToken': csrftoken,
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify(data),
    });

    localStorage.removeItem(`${currentView}_rubrosData`);
    localStorage.removeItem(`${currentView}_selectedPresupuesto`);

    if (response.ok) {
      setSnackbarMessage(`Presupuesto eliminado exitosamente.`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);

      setUpdatedRubros(updatedRubrosCopy);
      setInputValues(updatedInputValues);
      setMonthlyTotals(newMonthlyTotals);
      setRubrosTotals(newRubrosTotals);
    } else {
      console.error('Error al eliminar el ítem');
    }
  };

  const calculateAnnualTotal = (totals) => {
    return totals.reduce((acc, curr) => acc + curr, 0);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const exportRubrosToExcel = () => {
    const wb = XLSX.utils.book_new();
    const data = [];

    // Agregar encabezados
    const headers = ['Id', 'Rubros', 'Subrubros', 'Centro De Costos', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    data.push(headers);

    // Recorrer los rubros y subrubros
    updatedRubros.forEach((rubro) => {
      if (Array.isArray(rubro.subrubros)) {
        rubro.subrubros.forEach((subrubro) => {
          if (Array.isArray(subrubro.items)) {
            subrubro.items.forEach((item, itemIndex) => {

              const centroCostoid = item.centroCostoid;
              const subrubros = `${subrubro.codigo} ${subrubro.nombre}`;
              const row = [centroCostoid, rubro.nombre, subrubros, item.nombre];

              // Agregar valores mensuales
              MONTHS.forEach((_, monthIndex) => {
                const inputId = `outlined-basic-${updatedRubros.indexOf(rubro)}-${rubro.subrubros.indexOf(subrubro)}-${itemIndex}-${monthIndex}`;
                row.push(inputValues[inputId]?.value || 0);
              });

              data.push(row);
            });
          }
        });
      }
    });

    // Convertir a hoja de Excel
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Calcular el ancho de las columnas basándose en la longitud máxima de los valores
    const maxLengths = headers.map((header, i) => {
      return Math.max(
        header.length, // Longitud del encabezado
        ...data.map(row => (row[i] ? row[i].toString().length : 0)) // Longitud máxima de los datos en la columna
      );
    });

    // Establecer el ancho de las columnas en función de los datos más largos
    ws['!cols'] = maxLengths.map(length => ({ wch: length + 2 }));

    // Añadir la hoja de Excel al libro
    XLSX.utils.book_append_sheet(wb, ws, 'Rubros');

    // Escribir el archivo Excel
    XLSX.writeFile(wb, `${uen}.xlsx`);

    setTimeout(() => {
      localStorage.removeItem(`${currentView}_rubrosData`);
      localStorage.removeItem(`${currentView}_selectedPresupuesto`);
      window.location.reload();
    }, 500);
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      processImportedData(jsonData);
    }
  };

  const handleSpeedDialClick = () => {
    fileInputRef.current.click();
  };

  const processImportedData = (data) => {
    const newInputValues = { ...inputValues };
    const newMonthlyTotals = [...monthlyTotals];
    const newRubrosTotals = { ...rubrosTotals };
  
    // Itera sobre los datos importados
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const centroCostoid = row[0];
      const rubroName = row[1];
  
      // Dividir subrubro en código y nombre
      const subrubroData = row[2].split(' ');
      const subrubroCodigo = subrubroData[0];
      const subrubroName = subrubroData.slice(1).join(' ');
      const itemName = row[3];
      const monthlyValues = row.slice(4, 16);
  
      // Filtrar si todos los valores mensuales son 0 o nulos
      const allValuesAreZero = monthlyValues.every(monthValue => monthValue === 0 || monthValue === null);
      
      if (allValuesAreZero) {
        // Si todos los valores son cero o nulos, omitimos esta fila
        continue;
      }
  
      // Buscar si el rubro ya existe en updatedRubros
      let rubro = updatedRubros.find(r => r.nombre === rubroName);
  
      // Si no existe, crea uno nuevo
      if (!rubro) {
        rubro = { nombre: rubroName, subrubros: [] };
        updatedRubros.push(rubro);
      }
  
      // Buscar si el subrubro ya existe en el rubro
      let subrubro = rubro.subrubros.find(s => s.codigo.toString() === subrubroCodigo && s.nombre === subrubroName);
  
      // Si no existe, crea uno nuevo
      if (!subrubro) {
        subrubro = { codigo: subrubroCodigo, nombre: subrubroName, items: [] };
        rubro.subrubros.push(subrubro);
      }
  
      subrubro.items = subrubro.items || [];
      const item = { nombre: itemName };
  
      // Procesar valores mensuales y actualizar totales
      monthlyValues.forEach((monthValue, monthIndex) => {
        const numericValue = monthValue || 0;
  
        if (numericValue !== 0) {
          const inputId = `outlined-basic-${updatedRubros.indexOf(rubro)}-${rubro.subrubros.indexOf(subrubro)}-${subrubro.items.length}-${monthIndex}`;
  
          // Organizar los valores y el id a la que pertenece
          newInputValues[inputId] = {
            value: numericValue,
            centroCostoid: centroCostoid,
          };
  
          // Actualizar los totales del rubro
          if (!newRubrosTotals[rubroName]) {
            newRubrosTotals[rubroName] = Array(12).fill(0);
          }
          newRubrosTotals[rubroName][monthIndex] += numericValue;
  
          // Actualizar los totales mensuales generales
          newMonthlyTotals[monthIndex] += numericValue;
  
          // Asignar el valor mensual al ítem
          item[inputId] = numericValue;
        }
      });
  
      // Solo agregar el ítem si tiene al menos un valor diferente de 0
      if (Object.keys(item).length > 1) {
        subrubro.items.push(item);
      }
    }
  
    setUpdatedRubros([...updatedRubros]); // Se asegura de combinar importados con existentes
    setInputValues(newInputValues);
    setRubrosTotals(newRubrosTotals);
    setMonthlyTotals(newMonthlyTotals);
  };
  

  const handleUpdatePresupuesto = async () => {
    const csrftoken = getCookie('csrftoken');
    const token = localStorage.getItem('token');

    const data = Object.keys(inputValues).map(inputId => {
      const [_, basic, rubroIndex, subrubroIndex, itemIndex, colIndex] = inputId.split('-');
      const inputValue = inputValues[inputId];
      const presupuestomes = parseFloat(inputValue?.value || 0);

      return {
        id: parseInt(inputValue.id),
        usuario: userId,
        uen: uen,
        cuenta: parseInt(inputValue.centroCostoid),
        rubro: parseInt(rubroIndex),
        subrubro: parseInt(subrubroIndex),
        item: parseInt(itemIndex),
        meses: parseInt(colIndex),
        presupuestomes: isNaN(presupuestomes) ? 0 : presupuestomes,
        updatedRubros: updatedRubros,
        rubrosTotals: rubrosTotals,
        monthlyTotals: monthlyTotals,
      };
    });

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/presupuestos/batch-update/`, {
        method: 'PATCH',
        headers: {
          'X-CSRFToken': csrftoken,
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      localStorage.removeItem(`${currentView}_rubrosData`);
      localStorage.removeItem(`${currentView}_selectedPresupuesto`);

      if (response.ok) {
        const result = await response.json();
        const { created, updated } = result;

        setSnackbarMessage(`Presupuesto actualizado exitosamente. ${updated} actualizados, ${created} creados.`);
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      } else {
        throw new Error('Error in response');
      }
    } catch (error) {
      setSnackbarMessage('Error al actualizar el presupuesto.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setSnackbarOpen(true);
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  return (
    <>
      <div style={{ marginLeft: 5 }}>
        <table style={styles.tableContainer}>
          <thead>
            <tr>
              <th style={styles.tableCell}><Typography>Rubro/Mes</Typography></th>
              {['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'].map((month, index) => (
                <th key={index} style={styles.tableCell}><Typography>{month}</Typography></th>
              ))}
              <th style={styles.tableCell}><Typography>Total Anual</Typography></th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(rubrosTotals).map(([rubroName, totals], index) => (
              <tr key={index}>
                <td style={styles.tableCell}><Typography>{rubroName}</Typography></td>
                {totals.map((total, monthIndex) => (
                  <td key={monthIndex} style={styles.totalCell(total)}>
                    <Typography>{Math.round(total)}</Typography>
                  </td>
                ))}
                <td style={styles.totalCell(calculateAnnualTotal(totals))}>
                  <Typography>{Math.round(calculateAnnualTotal(totals))}</Typography>
                </td>
              </tr>
            ))}
            <tr>
              <td style={styles.tableCell}><Typography>Total General</Typography></td>
              {monthlyTotals.map((total, index) => (
                <td key={index} style={styles.totalCell(total)}>
                  <Typography>{Math.round(total)}</Typography>
                </td>
              ))}
              <td style={styles.totalCell(calculateAnnualTotal(monthlyTotals))}>
                <Typography>{Math.round(calculateAnnualTotal(monthlyTotals))}</Typography>
              </td>
            </tr>
          </tbody>
        </table>
        <table style={router.pathname === "/uen/constructora" ? styles.tableConstructora : router.pathname === "/uen/inmobiliaria" ? styles.tableInmobiliaria : router.pathname === "/uen/unidad-apoyo" ? styles.tableUA : styles.table}>
          <thead>
            <tr>
              <th style={styles.tableHeader}>
                <Typography>Rubro</Typography>
              </th>
              {MONTHS.map((month, index) => (
                <th style={styles.monthHeader} key={index}>
                  <Typography>{month} 24</Typography>
                </th>
              ))}
            </tr>
          </thead>
        </table>
        {updatedRubros.map((rubro, rubroIndex) => (
          <Accordion key={rubroIndex}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`panel${rubroIndex}-content`}
              id={`panel${rubroIndex}-header`}
              sx={router.pathname === "/uen/constructora" ? styles.accordionSummaryConstructora : router.pathname === "/uen/inmobiliaria" ? styles.accordionSummaryInmobiliaria : router.pathname === "/uen/unidad-apoyo" ? styles.accordionSummaryUA : styles.accordionSummary}>
              <Typography>{rubro.nombre}</Typography>
            </AccordionSummary>
            {
              rubro.subrubros.map((subrubro, subrubroIndex) => (
                <Accordion key={subrubroIndex}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls={`panel${rubroIndex}-${subrubroIndex}-content`}
                    id={`panel${rubroIndex}-${subrubroIndex}-header`}
                    sx={router.pathname === "/uen/constructora" ? styles.subAccordionSummaryConstructora : router.pathname === "/uen/inmobiliaria" ? styles.subAccordionSummaryInmobiliaria : router.pathname === "/uen/unidad-apoyo" ? styles.subAccordionSummaryUA : styles.subAccordionSummary}>
                    <Typography>{`${subrubro.codigo} ${subrubro.nombre}`}</Typography>
                  </AccordionSummary>
                  {updatedRubros[rubroIndex] && updatedRubros[rubroIndex].subrubros && updatedRubros[rubroIndex].subrubros[subrubroIndex] && updatedRubros[rubroIndex].subrubros[subrubroIndex].items && updatedRubros[rubroIndex].subrubros[subrubroIndex].items.length > 0 ? (
                    <table style={{ width: "500px" }}>
                      <tbody>
                        {updatedRubros[rubroIndex].subrubros[subrubroIndex].items.map((item, itemIndex) => (
                          <tr key={itemIndex}>
                            <td style={styles.itemCell}>
                              <Typography>{item.nombre}</Typography>
                              <HoverButton onRemove={() => handleRemoveItem(rubroIndex, subrubroIndex, itemIndex)} />
                            </td>
                            {MONTHS.map((_, colIndex) => {
                              const inputId = `outlined-basic-${rubroIndex}-${subrubroIndex}-${itemIndex}-${colIndex}`;
                              return (
                                <td key={colIndex}>
                                  <input
                                    type="number"
                                    id={inputId}
                                    style={styles.input}
                                    value={inputValues[inputId]?.value || ''}
                                    onChange={(e) => handleInputChange(e.target.value, colIndex, rubro.nombre, inputId)}
                                  />
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div style={{ display: 'flex', width: '100%', justifyContent: 'center', alignItems: 'center', height: 40 }}>
                      <Typography sx={{ color: '#ABABAB' }}>No hay centro de costo creado</Typography>
                    </div>
                  )}
                  <button style={styles.dialogButton} onClick={handleOpen}>
                    <AddCircleOutlineIcon />
                  </button>
                </Accordion>
              ))
            }
          </Accordion>
        ))}
      </div >
      <input
        type="file"
        accept=".xlsx, .xls"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <SpeedDial
        ariaLabel="SpeedDial basic example"
        sx={styles.speedDial(isSmallScreen, opacity)}
        icon={< AddIcon />}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <SpeedDialAction
          key={'Download'}
          icon={<CloudDownloadIcon />}
          tooltipTitle={'Descargar archivo'}
          onClick={exportRubrosToExcel}
        />
        <SpeedDialAction
          key={'Upload'}
          icon={<CloudUploadIcon />}
          tooltipTitle={'Subir archivo'}
          onClick={handleSpeedDialClick}
        />
        <SpeedDialAction
          key={'Save'}
          icon={<SaveIcon />}
          tooltipTitle={'Guardar'}
          onClick={handleUpdatePresupuesto}
          disabled={isUsed}
        />

      </SpeedDial>
      <Dialog open={open} onClose={handleClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <DialogTitle id="alert-dialog-title">Crear centro de costos</DialogTitle>
        <DialogContent>
          <Autocomplete
            options={updatedRubros.map((rubro) => rubro.nombre)}
            sx={{ width: 300, marginTop: 5 }}
            renderInput={(params) => <TextField {...params} label="Rubro" />}
            onChange={(event, newValue) => {
              if (newValue) {
                setSelectedRubro(newValue);
              } else {
                console.error("Rubro no seleccionado");
              }
            }}
          />
          {selectedRubro && (
            <Autocomplete
              options={updatedRubros.find((r) => r.nombre === selectedRubro)?.subrubros.map((subrubro) => ({
                label: `${subrubro.codigo} ${subrubro.nombre}`,
                id: subrubro.id
              })) || []}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              sx={{ width: 300, marginTop: 5 }}
              renderInput={(params) => <TextField {...params} label="Subrubro" />}
              onChange={(event, newValue) => {
                if (newValue) {
                  setSelectedSubrubro(newValue.label);
                } else {
                  console.error("Subrubro no seleccionado");
                }
              }}
            />
          )}
          {selectedSubrubro && (
            Array.isArray(updatedcentroCostos) && updatedcentroCostos.length > 0 ? (
              <Autocomplete
                options={updatedcentroCostos.map((centroCostos) =>
                  `${centroCostos.codigo} ${centroCostos.nombre} ${centroCostos.regional.nombre}`) || []
                }
                sx={{ width: 300, marginTop: 5 }}
                renderInput={(params) => <TextField {...params} label="Centro Costos" />}
                onChange={(event, newValue) => {
                  if (newValue) {
                    const selectedCentroCosto = updatedcentroCostos.find(c =>
                      `${c.codigo} ${c.nombre} ${c.regional.nombre}` === newValue
                    );
                    if (selectedCentroCosto) {
                      setCentroCostoid(selectedCentroCosto.id);
                    } else {
                      console.error("Centro de costos no encontrado o no válido");
                    }
                    setNewItem(newValue);
                  } else {
                    console.error("Centro de costos no seleccionado");
                    setNewItem('');
                  }
                }}
              />
            ) : (
              <Typography sx={{
                display: 'flex', justifyContent: 'center', mt: 3,
                alignItems: 'center'
              }}>No Hay Centro De Costos habilitados</Typography>
            )
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleAddItem} aria-hidden={false} autoFocus>
            Aceptar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CustomTable;