import { useEffect } from 'react';
import Image from 'next/image';
import SidebarStyle from '../styles/sidebar';
import React, { useState } from 'react';
import InacarLogo from '../../public/logo-INACAR.png';
import { Drawer, List, ListItem, ListItemText, ListItemIcon, Collapse, Toolbar, Typography, Avatar, Button } from '@mui/material';
import { ExpandLess, ExpandMore, Home as HomeIcon, Description as DescriptionIcon, BarChart as BarChartIcon, AllInbox } from '@mui/icons-material';
import AvatarUser from './avatarUser';
import LogoutIcon from '@mui/icons-material/Logout';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { openDB } from "idb";

const Sidebar = () => {
  const [openUEN, setOpenUEN] = useState(false);
  const [openInformes, setOpenInformes] = useState(false);
  const [openHistorial, setOpenHistorial] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [user, setUser] = useState('');

  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const first_name = localStorage.getItem('first_name');
      const last_name = localStorage.getItem('last_name');
      setUser(first_name + ' ' + last_name || 'Usuario');
    }
  }, []);

  const handleUENClick = () => {
    setOpenUEN(!openUEN);
    setSelectedItem('UEN');
  };

  const handleInformesClick = () => {
    setOpenInformes(!openInformes);
    setSelectedItem('Informes');
  };
  const handleHistorialClick = () => {
    setOpenHistorial(!openHistorial);
    setSelectedItem('Historial');
  };

  const handleItemClick = (item, path) => {
    setSelectedItem(item);
    // window.location.href = path;
    router.push(path);
  };
  const initDB = async () => {
    const currentDB = await openDB("PresupuestoDB");
    if (currentDB.objectStoreNames.contains("rubrosData")) return currentDB;
    currentDB.close();
    return openDB("PresupuestoDB", currentDB.version + 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("rubrosData")) db.createObjectStore("rubrosData");
      },
    });
  };
  const deleteDataFromDB = async (store, key) => {
    try {
      const db = await initDB();
      await db.delete(store, key);
    } catch (error) {
      console.error("Error deleting from IndexedDB:", error);
    }
  };
  const getDataFromDB = async (store, key) => {
    try {
      const db = await initDB();
      return await db.get(store, key);
    } catch (error) {
      console.error("Error accessing IndexedDB:", error);
    }
  };

  const deleteDatabase = async () => {
    const dbName = "PresupuestoDB"; // Nombre de tu base de datos
    const request = indexedDB.deleteDatabase(dbName);
    request.onsuccess = () => {
    
    };

    request.onerror = (event) => {
      console.error(`Error al eliminar la base de datos ${dbName}:`, event);
    };

    request.onblocked = () => {
      console.warn(`La base de datos ${dbName} está bloqueada y no se puede eliminar.`);
    };
  }

  const handleLogout = async () => {
    try {

      await deleteDatabase(); // Call the function to delete all data

      // Clear localStorage
      localStorage.clear();
      router.push('/login');
      // Optionally, redirect the user or perform additional cleanup here
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  useEffect(() => {
  }, [router.pathname]);

  return (
    <Drawer variant="permanent" sx={router.pathname === "/uen/constructora" ? SidebarStyle.sidebarConstructora : router.pathname === "/uen/inmobiliaria" ? SidebarStyle.sidebarInmobiliaria : router.pathname === "/uen/unidad-apoyo" ? SidebarStyle.sidebarUA : SidebarStyle.sidebar} >
      <div style={SidebarStyle.content}>
        <div>
          <div sx={router.pathname === "/uen/constructora" ? SidebarStyle.iconConstructora : router.pathname === "/uen/inmobiliaria" ? SidebarStyle.iconInmobiliaria : router.pathname === "/uen/unidad-apoyo" ? SidebarStyle.iconUA : SidebarStyle.icon}>
            <Toolbar>
              <Typography variant="h6" noWrap style={{ cursor: 'pointer' }} onClick={() => handleItemClick('Inicio', '/inicio')}>
                <Image src={InacarLogo} alt="Logo" height={50} width={100} priority />
              </Typography>
            </Toolbar>
          </div>
          <List>
            <ListItem
              button
              onClick={handleUENClick}
              selected={selectedItem === 'UEN'}
              sx={router.pathname === "/uen/constructora" ? SidebarStyle.titleItemConstructora : router.pathname === '/uen/inmobiliaria' ? SidebarStyle.titleItemInmobiliaria : router.pathname === "/uen/unidad-apoyo" ? SidebarStyle.titleItemUA : SidebarStyle.titleItem}
            >
              <ListItemIcon sx={{ color: '#FFFFFF' }}>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="UEN" />
              {openUEN ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={openUEN} timeout="auto" unmountOnExit>
              <List component="div" disablePadding style={{ display: 'flex', flexDirection: 'row' }}>
                <div>
                  <div style={SidebarStyle.line} />
                </div>
                <div>
                  <ListItem button selected={selectedItem === 'Constructora'} onClick={() => handleItemClick('Constructora', '/uen/constructora')} sx={router.pathname === "/uen/constructora" ? SidebarStyle.item : router.pathname === '/uen/inmobiliaria' ? SidebarStyle.itemInmobiliaria : router.pathname === "/uen/unidad-apoyo" ? SidebarStyle.itemUA : SidebarStyle.item}>
                    <ListItemText primary="Constructora" />
                  </ListItem>
                  <ListItem button selected={selectedItem === 'Inmobiliaria'} onClick={() => handleItemClick('Inmobiliaria', '/uen/inmobiliaria')} sx={router.pathname === "/uen/constructora" ? SidebarStyle.item : router.pathname === '/uen/inmobiliaria' ? SidebarStyle.itemInmobiliaria : router.pathname === "/uen/unidad-apoyo" ? SidebarStyle.itemUA : SidebarStyle.item}>
                    <ListItemText primary="Inmobiliaria" />
                  </ListItem>
                  <ListItem button selected={selectedItem === 'Promotora'} onClick={() => handleItemClick('Promotora', '/uen/promotora')} sx={router.pathname === "/uen/constructora" ? SidebarStyle.item : router.pathname === '/uen/inmobiliaria' ? SidebarStyle.itemInmobiliaria : router.pathname === "/uen/unidad-apoyo" ? SidebarStyle.itemUA : SidebarStyle.item}>
                    <ListItemText primary="Promotora" />
                  </ListItem>
                  <ListItem button selected={selectedItem === 'Unidad De Apoyo'} onClick={() => handleItemClick('Unidad De Apoyo', '/uen/unidad-apoyo')} sx={router.pathname === "/uen/constructora" ? SidebarStyle.item : router.pathname === '/uen/inmobiliaria' ? SidebarStyle.itemInmobiliaria : router.pathname === "/uen/unidad-apoyo" ? SidebarStyle.itemUA : SidebarStyle.item}>
                    <ListItemText primary="Unidad de Apoyo" />
                  </ListItem>
                </div>
              </List>
            </Collapse>

            <ListItem
              button
              onClick={handleInformesClick}
              selected={selectedItem === 'Informes'}
              sx={router.pathname === "/uen/constructora" ? SidebarStyle.titleItemConstructora : router.pathname === '/uen/inmobiliaria' ? SidebarStyle.titleItemInmobiliaria : SidebarStyle.titleItem}
            >
              <ListItemIcon sx={{ color: '#FFFFFF' }}>
                <DescriptionIcon />
              </ListItemIcon>
              <ListItemText primary="Informes" />
              {openInformes ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={openInformes} timeout="auto" unmountOnExit>
              <List component="div" disablePadding style={{ display: 'flex', flexDirection: 'row' }}>
                <div>
                  <div style={SidebarStyle.line}></div>
                </div>
                <div>
                  <ListItem button selected={selectedItem === 'Detallado'} onClick={() => handleItemClick('Detallado', '/informes/detallado')} sx={router.pathname === "/uen/constructora" ? SidebarStyle.item : router.pathname === '/uen/inmobiliaria' ? SidebarStyle.itemInmobiliaria : router.pathname === "/uen/unidad-apoyo" ? SidebarStyle.itemUA : SidebarStyle.item}>
                    <ListItemText primary="Detallado" />
                  </ListItem>
                  <ListItem button selected={selectedItem === 'Actualizado'} onClick={() => handleItemClick('Actualizado', '/informes/actualizado')} sx={router.pathname === "/uen/constructora" ? SidebarStyle.item : router.pathname === '/uen/inmobiliaria' ? SidebarStyle.itemInmobiliaria : router.pathname === "/uen/unidad-apoyo" ? SidebarStyle.itemUA : SidebarStyle.item}>
                    <ListItemText primary="Actualizado" />
                  </ListItem>
                  <ListItem button selected={selectedItem === 'Consolidado'} onClick={() => handleItemClick('Consolidado', '/informes/consolidado')} sx={router.pathname === "/uen/constructora" ? SidebarStyle.item : router.pathname === '/uen/inmobiliaria' ? SidebarStyle.itemInmobiliaria : router.pathname === "/uen/unidad-apoyo" ? SidebarStyle.itemUA : SidebarStyle.item}>
                    <ListItemText primary="Consolidado" />
                  </ListItem>
                  <ListItem button selected={selectedItem === 'Ventas'} onClick={() => handleItemClick('Ventas', '/informes/ventas')} sx={router.pathname === "/uen/constructora" ? SidebarStyle.item : router.pathname === '/uen/inmobiliaria' ? SidebarStyle.itemInmobiliaria : router.pathname === "/uen/unidad-apoyo" ? SidebarStyle.itemUA : SidebarStyle.item}>
                    <ListItemText primary="Ventas" />
                  </ListItem>
                  <ListItem button selected={selectedItem === 'Escritura'} onClick={() => handleItemClick('Escritura', '/informes/escritura')} sx={router.pathname === "/uen/constructora" ? SidebarStyle.item : router.pathname === '/uen/inmobiliaria' ? SidebarStyle.itemInmobiliaria : router.pathname === "/uen/unidad-apoyo" ? SidebarStyle.itemUA : SidebarStyle.item}>
                    <ListItemText primary="Escritura" />
                  </ListItem>
                </div>
              </List>
            </Collapse>

            <ListItem button selected={selectedItem === 'Gráficas'} onClick={() => handleItemClick('Gráficas', '/graficas')} sx={router.pathname === "/uen/constructora" ? SidebarStyle.titleItemConstructora : router.pathname === '/uen/inmobiliaria' ? SidebarStyle.titleItemInmobiliaria : router.pathname === "/uen/unidad-apoyo" ? SidebarStyle.titleItemUA : SidebarStyle.titleItem}>
              <ListItemIcon sx={{ color: '#FFFFFF' }}>
                <BarChartIcon />
              </ListItemIcon>
              <ListItemText primary="Gráficas" />
            </ListItem>
            {/* <ListItem button selected={selectedItem === 'Historial'} onClick={() => handleItemClick('Historial', '/historial')} sx={router.pathname === "/uen/constructora" ? SidebarStyle.titleItemConstructora : router.pathname === '/uen/inmobiliaria' ? SidebarStyle.titleItemInmobiliaria : router.pathname === "/uen/unidad-apoyo" ? SidebarStyle.titleItemUA : SidebarStyle.titleItem}>
              <ListItemIcon sx={{ color: '#FFFFFF' }}>
                <AllInbox />
              </ListItemIcon>
              <ListItemText primary="Historial" />
            </ListItem> */}
             <ListItem
              button
              onClick={handleHistorialClick}
              selected={selectedItem === 'Historial'}
              sx={router.pathname === "/uen/constructora" ? SidebarStyle.titleItemConstructora : router.pathname === '/uen/inmobiliaria' ? SidebarStyle.titleItemInmobiliaria : SidebarStyle.titleItem}
            >
              <ListItemIcon sx={{ color: '#FFFFFF' }}>
                <DescriptionIcon />
              </ListItemIcon>
              <ListItemText primary="Historial" />
              {openHistorial ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={openHistorial} timeout="auto" unmountOnExit>
              <List component="div" disablePadding style={{ display: 'flex', flexDirection: 'row' }}>
                <div>
                  <div style={SidebarStyle.line}></div>
                </div>
                <div>
                  <ListItem button selected={selectedItem === 'Inicial'} onClick={() => handleItemClick('Inicial', '/historial/inicial')} sx={router.pathname === "/uen/constructora" ? SidebarStyle.item : router.pathname === '/uen/inmobiliaria' ? SidebarStyle.itemInmobiliaria : router.pathname === "/uen/unidad-apoyo" ? SidebarStyle.itemUA : SidebarStyle.item}>
                    <ListItemText primary="Inicial" />
                  </ListItem>
                  <ListItem button selected={selectedItem === 'Actualizado'} onClick={() => handleItemClick('Actualizado', '/historial/actualizado')} sx={router.pathname === "/uen/constructora" ? SidebarStyle.item : router.pathname === '/uen/inmobiliaria' ? SidebarStyle.itemInmobiliaria : router.pathname === "/uen/unidad-apoyo" ? SidebarStyle.itemUA : SidebarStyle.item}>
                    <ListItemText primary="Actualizado" />
                  </ListItem>
                
                </div>
              </List>
            </Collapse>
          </List>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={SidebarStyle.contentlogout}>
            <AvatarUser nombre={user} />
            <Typography sx={{ marginLeft: 1 }} color='#fff'>{user}</Typography>
          </div>
          <div style={SidebarStyle.buttonlogout}>
            <Button
              variant="text"
              startIcon={<LogoutIcon color='white' />}
              sx={{ color: 'white' }}
              onClick={() => handleLogout()}
            />
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default Sidebar;
