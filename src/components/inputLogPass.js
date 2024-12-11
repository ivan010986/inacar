import { TextField } from "@mui/material";

const InputLogPass = ({ name, value, onChange, children, onKeyDown }) => {
  return (
    <TextField
      id={name}
      name={name}
      label={children}
      variant="standard"
      type="password"
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      InputProps={{
        style: {
          color: 'white',
        },
      }}
      InputLabelProps={{
        style: {
          color: 'white',
        },
      }}
      sx={{
        '& .MuiInput-underline:before': {
          borderBottomColor: 'white',
        },
        '& .MuiInput-underline:after': {
          borderBottomColor: 'white',
        },
        '& .MuiInputBase-input': {
          color: 'white',
        },
        '& .MuiInputLabel-root': {
          color: 'white',
        },
        width: 400,
        marginBottom: 6
      }}
    />
  );
};

export default InputLogPass;