import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Accordion, AccordionSummary, AccordionDetails, Typography, Autocomplete, TextField, DialogTitle, DialogContent, Dialog, DialogActions, Button, Tooltip } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { getCookie } from '@/utils/cookieUtils';
import Sidebar from '@/components/sidebar';

const CustomerTableVenta = () => {
    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const zonas = ['Norte', 'Centro', 'Occidente', 'Oriente', 'Nacional'];

    const [open, setOpen] = useState(false);
    const [centroCostos, setCentroCostos] = useState([]);
    const [selectedCentroCosto, setSelectedCentroCosto] = useState(null);
    const [currentZona, setCurrentZona] = useState(null); // Zona actual para agregar filas
    const [rowsByZona, setRowsByZona] = useState(zonas.reduce((acc, zona) => ({ ...acc, [zona]: [] }), {}));

    const handleClickOpen = (zona) => {
        setCurrentZona(zona); // Establece la zona actual
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedCentroCosto(null); // Restablece el centro de costo seleccionado al cerrar
    };

    useEffect(() => {
        const fetchData = async () => {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const csrftoken = getCookie('csrftoken');
            const token = localStorage.getItem('token');
            const centroCostosResponse = await fetch(`${API_URL}/CentroCostos/`, {
                method: 'GET',
                headers: {
                    'X-CSRFToken': csrftoken,
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });
            if (!centroCostosResponse.ok) throw new Error(`HTTP error! Status: ${centroCostosResponse.status}`);
            const centroCostosData = await centroCostosResponse.json();
            let Promotora = centroCostosData.results.filter(item => item.uen.nombre === 'Promotora');
            setCentroCostos(Promotora || []);
        }
        fetchData();
    }, []);

    const addRow = () => {
        if (selectedCentroCosto && currentZona) {
            const centroDeCostoLabel = selectedCentroCosto.label;
            setRowsByZona(prev => ({
                ...prev,
                [currentZona]: [...prev[currentZona], { centroDeCosto: centroDeCostoLabel, unid: Array(meses.length).fill(0), val: Array(meses.length).fill(0) }]
            }));
            handleClose();
        }
    };

    const handleInputChange = (zona, rowIndex, monthIndex, type, value) => {
        const newRows = [...rowsByZona[zona]];
        newRows[rowIndex][type][monthIndex] = Number(value) || 0;
        setRowsByZona(prev => ({ ...prev, [zona]: newRows }));
    };

    const calculateMonthlyTotals = (zona, type) => {
        return meses.map((_, monthIndex) => {
            return rowsByZona[zona].reduce((total, row) => total + row[type][monthIndex], 0);
        });
    };

    const removeRow = (zona, rowIndex) => {
        setRowsByZona(prev => ({
            ...prev,
            [zona]: prev[zona].filter((_, index) => index !== rowIndex)
        }));
    };

    const calculateRowTotals = (row) => {
        return {
            unid: row.unid.reduce((total, value) => total + value, 0),
            val: row.val.reduce((total, value) => total + value, 0),
        };
    };

    const exportToExcel = (zona) => {
        const headers = ['Centro de costo', ...meses.flatMap(mes => [`Unid ${mes}`, `Val ${mes}`]), 'Total Unid', 'Total Val'];
        const data = rowsByZona[zona].map(row => {
            const { unid, val } = calculateRowTotals(row);
            return [
                row.centroDeCosto,
                ...row.unid.flatMap((u, index) => [u, row.val[index]]),
                unid,
                val,
            ];
        });

        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, zona);
        XLSX.writeFile(workbook, `${zona}.xlsx`);
    };

    return (
        <div style={{ display: "flex", flexDirection: "row" }}>
            <Sidebar />
            <div style={{ display: "flex", flexDirection: "column", width: "85%",marginLeft: "10px" }}>
                <Typography variant="h4" style={{ marginBottom: '30px', marginTop: '20px' }}>Informe Preventas</Typography>
                {zonas.map(zona => (
                    <Accordion key={zona}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon style={{ color: 'white' }} />}
                            aria-controls={`${zona}-content`}
                            id={`${zona}-header`}
                            style={{ background: 'rgb(253, 128, 2, 1)', borderRadius: '6px 6px 6px 6px', color: 'white' }}
                        ><Typography>{zona}</Typography> </AccordionSummary>
                        <AccordionDetails>
                            <div style={{ overflowX: 'auto' }}>
                                <TableContainer component={Paper}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell style={{ width: '200px', position: 'sticky', left: 0, background: 'white', zIndex: 1 }}>PREVENTAS PRESUPUESTADAS 2024</TableCell>
                                                {meses.map((mes) => (
                                                    <TableCell colSpan={2} key={mes} style={{ alignItems: 'center', position: 'sticky', left: 0, background: 'white', zIndex: 1 }}>{mes}</TableCell>
                                                ))}
                                                <TableCell><strong>Total unid</strong></TableCell>
                                                <TableCell><strong>Total Val</strong></TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell style={{ width: '200px', position: 'sticky', left: 0, background: 'white', zIndex: 1 }}>Centro de costo</TableCell>
                                                {meses.map((mes, index) => (
                                                    <React.Fragment key={index}>
                                                        <TableCell>Unid</TableCell>
                                                        <TableCell>Val</TableCell>
                                                    </React.Fragment>
                                                ))}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {rowsByZona[zona].map((row, rowIndex) => {
                                                const { unid, val } = calculateRowTotals(row);
                                                return (
                                                    <TableRow key={rowIndex}>
                                                        <TableCell style={{ position: 'sticky', left: 0, background: 'white', zIndex: 1 }}>
                                                            <Typography>
                                                                {row.centroDeCosto}
                                                            </Typography>
                                                        </TableCell>
                                                        {meses.map((mes, monthIndex) => (
                                                            <React.Fragment key={monthIndex}>
                                                                <TableCell>
                                                                    <input
                                                                        type="number"
                                                                        style={{ width: '50px' }}
                                                                        value={row.unid[monthIndex]}
                                                                        onChange={(e) => handleInputChange(zona, rowIndex, monthIndex, 'unid', e.target.value)}
                                                                    />
                                                                </TableCell>
                                                                <TableCell>
                                                                    <input
                                                                        type="number"
                                                                        style={{ width: '100px' }}
                                                                        value={row.val[monthIndex]}
                                                                        onChange={(e) => handleInputChange(zona, rowIndex, monthIndex, 'val', e.target.value)}
                                                                    />
                                                                </TableCell>
                                                            </React.Fragment>
                                                        ))}
                                                        <TableCell><strong>{unid}</strong></TableCell>
                                                        <TableCell><strong>{val}</strong></TableCell>
                                                        <TableCell>
                                                            <DeleteOutlineIcon
                                                                style={{ cursor: 'pointer', color: 'red' }}
                                                                onClick={() => removeRow(zona, rowIndex)}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                            <TableRow>
                                                <TableCell><strong>Totales</strong></TableCell>
                                                {calculateMonthlyTotals(zona, 'unid').map((total, monthIndex) => (
                                                    <React.Fragment key={monthIndex}>
                                                        <TableCell><strong>{total}</strong></TableCell>
                                                        <TableCell><strong>{calculateMonthlyTotals(zona, 'val')[monthIndex]}</strong></TableCell>
                                                    </React.Fragment>
                                                ))}
                                                <TableCell><strong>{calculateMonthlyTotals(zona, 'unid').reduce((a, b) => a + b, 0)}</strong></TableCell>
                                                <TableCell><strong>{calculateMonthlyTotals(zona, 'val').reduce((a, b) => a + b, 0)}</strong></TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                <div style={{
                                    position: 'sticky',
                                    bottom: '10px',
                                    right: '10px',
                                    display: 'flex',
                                    padding: '10px',
                                    marginTop: '20px',
                                }}>
                                    <Tooltip title="Agreagar centro de costo" arrow>
                                        <Button style={{
                                            background: 'white',
                                            height: '40px',
                                            cursor: 'pointer',
                                            width: '150px',
                                            color: 'black',
                                            border: '1px solid black',
                                            boxShadow: ' 0px 0px 10px 0px rgba(0,0,0,0.25)',
                                            marginRight: '10px',
                                        }} onClick={() => handleClickOpen(zona)}>
                                            <AddCircleOutlineIcon />
                                        </Button>
                                    </Tooltip>
                                    <Tooltip title="Exportar a Excel" arrow>
                                        <Button variant="contained" color="success" onClick={() => exportToExcel(zona)}>
                                            Exportar a Excel
                                        </Button>
                                    </Tooltip>
                                </div>

                            </div>

                        </AccordionDetails>
                    </Accordion>
                ))}
            </div>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="form-dialog-title"
            >
                <DialogTitle>
                    Selecciona un centro de costo para la zona {currentZona}
                </DialogTitle>
                <DialogContent style={{ background: 'white', width: '500px', height: '200px', marginTop: '20px' }}>
                    <Autocomplete
                        options={
                            centroCostos
                                .filter(centroCosto => centroCosto.regional.nombre === currentZona) // Filtrar por zona
                                .map((centroCosto) => ({
                                    label: `${centroCosto.codigo} ${centroCosto.nombre} ${centroCosto.regional.nombre}`,
                                    codigo: centroCosto.codigo,
                                })) || []
                        }
                        value={selectedCentroCosto}
                        onChange={(event, newValue) => setSelectedCentroCosto(newValue)}
                        renderInput={(params) => <TextField {...params} label="Centro de costo" />}
                        style={{ marginBottom: '90px' }}
                    />
                    <DialogActions>
                        <Button onClick={handleClose}>Cancelar</Button>
                        <Button onClick={addRow} autoFocus>
                            Agregar
                        </Button>
                    </DialogActions>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default CustomerTableVenta;