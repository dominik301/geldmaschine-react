import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import HouseIcon from '@mui/icons-material/House';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import InfoIcon from '@mui/icons-material/Info';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import CasinoIcon from '@mui/icons-material/Casino';
import PerecentIcon from '@mui/icons-material/Percent';

const drawerWidth = 55;

export default function PermanentDrawerLeft({children}) {
    const ICONS = [<CasinoIcon/>, <HouseIcon />, <SwapHorizIcon />, <CreditCardIcon />, <InfoIcon />, <ShowChartIcon />, <PerecentIcon />];

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <List>
          {['Spiel', 'Immobilien', 'Tauschen', 'Kredit', 'Statistik', 'Spielverlauf', 'Zinssatz'].map((text, index) => (
            <ListItem key={text} disablePadding>
              <ListItemButton>
                <ListItemIcon>
                    {ICONS[index]}
                </ListItemIcon>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      {children}
    </Box>
  );
}
