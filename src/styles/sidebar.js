const sidebarStyles = {
  
    content: {
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', paddingBottom: 10,

    },
    icon: {
        display: 'flex', background: 'rgb(253, 128, 2, 1)', paddingTop: 10, justifyContent: 'center'
    },
    iconInmobiliaria: {
        display: 'flex', background: 'rgb(0, 45, 175, 1)', paddingTop: 10, justifyContent: 'center'
    },
    iconUA: {
        display: 'flex', background: 'rgb(138, 138, 135, 1)', paddingTop: 10, justifyContent: 'center'
    },
    iconConstructora: {
        display: 'flex', background: 'rgb(75, 134, 128, 1)', paddingTop: 10, justifyContent: 'center'
    },
    sidebar: {
        width: 200, // Ancho del sidebar de 210 px
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
            width: 200,
            boxSizing: 'border-box',
            backgroundColor: 'rgb(253, 128, 2, 1)',
        },
    },
    sidebarInmobiliaria: {
        width: 200, // Ancho del sidebar de 210 px
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
            width: 200,
            boxSizing: 'border-box',
            backgroundColor: 'rgb(0, 45, 175, 1)',
        },
    },
    sidebarUA: {
        width: 200, // Ancho del sidebar de 210 px
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
            width: 200,
            boxSizing: 'border-box',
            backgroundColor: 'rgb(138, 138, 135, 1)',
        },
    },
    sidebarConstructora: {
        width: 200, // Ancho del sidebar de 210 px
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
            width: 200,
            boxSizing: 'border-box',
            backgroundColor: 'rgb(75, 134, 128, 1)',
        },
    },
    titleItem: {
        width: '90%',
        margin: 1,
        borderRadius: 3,
        color: '#FFFFFF',
        '&.Mui-selected': {
            backgroundColor: 'rgba(253, 128, 2, 1)', // Color del ítem seleccionado #3C3C3C al 55%
        },
        '&.Mui-selected:hover': {
            backgroundColor: 'rgba(253, 128, 2, 0.55)', // Mantener el color al pasar el cursor
        },
    },
    titleItemInmobiliaria: {
        width: '90%',
        margin: 1,
        borderRadius: 3,
        color: '#FFFFFF',
        '&.Mui-selected': {
            backgroundColor: 'rgba(0, 45, 175, 1)', // Color del ítem seleccionado #3C3C3C al 55%
        },
        '&.Mui-selected:hover': {
            backgroundColor: 'rgba(0, 45, 175, 0.55)', // Mantener el color al pasar el cursor
        },
    },
    titleItemUA: {
        width: '90%',
        margin: 1,
        borderRadius: 3,
        color: '#FFFFFF',
        '&.Mui-selected': {
            backgroundColor: 'rgba(138, 138, 135, 1)', // Color del ítem seleccionado #3C3C3C al 55%
        },
        '&.Mui-selected:hover': {
            backgroundColor: 'rgba(138, 138, 135, 0.55)', // Mantener el color al pasar el cursor
        },
    },
    titleItemConstructora: {
        width: '90%',
        margin: 1,
        borderRadius: 3,
        color: '#FFFFFF',
        '&.Mui-selected': {
            backgroundColor: 'rgba(75, 134, 128, 1)', // Color del ítem seleccionado #3C3C3C al 55%
        },
        '&.Mui-selected:hover': {
            backgroundColor: 'rgba(75, 134, 128, 0.55)', // Mantener el color al pasar el cursor
        },
    },
    item: {
        borderRadius: 3,
        color: '#FFFFFF',
        '&.Mui-selected': {
            backgroundColor: 'rgba(236, 137, 77, 1)',
        },
        '&.Mui-selected:hover': {
            backgroundColor: 'rgba(236, 137, 77, 0.55)',
        },
    },
    itemInmobiliaria: {
        borderRadius: 3,
        color: '#FFFFFF',
        '&.Mui-selected': {
            backgroundColor: 'rgba(0, 45, 175, 1)',
        },
        '&.Mui-selected:hover': {
            backgroundColor: 'rgba(0, 45, 175, 0.55)',
        },
    },
    itemUA: {
        borderRadius: 3,
        color: '#FFFFFF',
        '&.Mui-selected': {
            backgroundColor: 'rgba(138, 138, 135, 1)',
        },
        '&.Mui-selected:hover': {
            backgroundColor: 'rgba(138, 138, 135, 0.55)',
        },
    },
    itemConstructora: {
        borderRadius: 3,
        color: '#FFFFFF',
        '&.Mui-selected': {
            backgroundColor: 'rgba(75, 134, 128, 1)',
        },
        '&.Mui-selected:hover': {
            backgroundColor: 'rgba(75, 134, 128, 0.55)',
        },
    },
    line: {
        background: '#ffff', width: 1, height: '90%', margin: 12
    },
    contentlogout: {
        display: 'flex', flexDirection: 'row', margin: 15, alignItems: 'center', justifyContent: 'center'
    },
    buttonlogout: {
        display: 'flex', alignItems: 'center', flexDirection: 'column'
    }
};

export default sidebarStyles;
