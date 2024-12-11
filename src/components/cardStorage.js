import { Typography, Box } from "@mui/material";

import AvatarUser from "./avatarUser";



const CardStorage = ({ area, user, date, click }) => {

    return (
        <Box
        sx={{
          height:'auto',
          width: '70%',
          borderRadius: 3,
          padding: 3,
          boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
          marginTop: 3,
          marginLeft: 3,
          cursor: 'pointer',
          background:'#F3FFFE'
        }}
        onClick={click}
      >
        <Typography fontStyle="normal" fontWeight="700" fontSize="23px">
          {area || 'Área desconocida'}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 4,
          }}
        >
          <Box sx={{ display: 'flex', width: 300 }}>
            <AvatarUser nombre={user || 'Usuario desconocido'} />
            <Typography sx={{ marginLeft: 2 }}>
              {user || 'Usuario desconocido'}
            </Typography>
          </Box>
          <Typography>{date || 'Fecha desconocida'}</Typography>
        </Box>
      </Box>
    )
}
export default CardStorage;