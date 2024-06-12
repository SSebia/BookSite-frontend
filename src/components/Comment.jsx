import { Typography, Paper } from '@mui/material';

export const Comment = ({ name, text }) => (
    <Paper sx={{ p: 2, bgcolor: 'background.paper', boxShadow: 1 }}>
      <Typography variant="subtitle2" component="div" sx={{ fontWeight: 'bold' }}>
        {name}
      </Typography>
      <Typography variant="body2" component="div">
        {text}
      </Typography>
    </Paper>
);