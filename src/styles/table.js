const styles = {
  speedDial: (isSmallScreen, opacity) => ({
    position: 'fixed',
    bottom: isSmallScreen ? 8 : 16,
    right: isSmallScreen ? 8 : 16,
    opacity: opacity,
    transition: 'opacity 0.3s',
  }),
  table: {
    border: "none",
    borderRadius: '6px 6px 0 0',
    background: "rgb(253, 128, 2, 0.85)",
    color: 'white',
  },
  tableInmobiliaria: {
    border: "none",
    borderRadius: '6px 6px 0 0',
    background: "rgb(0, 45, 175, 0.85)",
    color: 'white',
  },
  tableUA: {
    border: "none",
    borderRadius: '6px 6px 0 0',
    background: "rgb(138, 138, 135, 0.85)",
    color: 'white',
  },
  tableConstructora: {
    border: "none",
    borderRadius: '6px 6px 0 0',
    background: "rgb(75, 134, 128, 0.85)",
    color: 'white',
  },
  tableHeader: {
    width: '400px',
  },
  monthHeader: {
    width: '150px',
  },
  accordionSummary: {
    background: "rgb(253, 128, 2)",
    color: 'white',
  },
  accordionSummaryInmobiliaria: {
    background: "rgb(0, 45, 175)",
    color: 'white',
  },
  accordionSummaryUA: {
    background: "rgb(138, 138, 135)",
    color: 'white',
  },
  accordionSummaryConstructora: {
    background: "rgb(75, 134, 128)",
    color: 'white',
  },
  subAccordionSummary: {
    background: "rgba(253, 128, 2, 0.85)",
    color: 'white',
  },
    subAccordionSummaryInmobiliaria: {
    background: "rgba(0, 45, 175, 0.85)",
    color: 'white',
  },
     subAccordionSummaryUA: {
    background: "rgba(138, 138, 135, 0.85)",
    color: 'white',
  },
   subAccordionSummaryConstructora: {
    background: "rgba(75, 134, 128, 0.85)",
    color: 'white',
  },
  itemCell: {
    width: '350px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: '16px',
  },
  input: {
    width: "97px",
    boxSizing: "border-box",
    borderRadius: 4
  },
  dialogButton: {
    width: '100%',
    background: 'white',
    border: 'none',
    cursor: 'pointer'
  },
  tableContainer: {
    width: '100%',
    marginTop: '5px', marginBottom: "20px"
    ,
    border: '1px solid #ccc',
    borderRadius: 4
  },
  tableCell: {
    textAlign: 'left',
    padding: '8px',
  },
  totalCell: (total) => ({
    textAlign: 'left',
    padding: '8px',
    color: total >= 0 ? 'green' : 'red',
    width:'150px'
  }),
};

export default styles;