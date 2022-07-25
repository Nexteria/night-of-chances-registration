import React from 'react'
import TextField from '@mui/material/TextField'


export const Input = ({ input, type, label, meta }) => {
  return (
    <TextField
      id={input.name}
      label={label}
      sx={{
        marginLeft: 'spacing.unit',
        marginRight: 'spacing.unit',
        width: 200,
      }}
      value={input.value}
      onChange={input.onChange}
      margin="normal"
      type={type}
      error={meta.touched && meta.error}
    />
  )
}
