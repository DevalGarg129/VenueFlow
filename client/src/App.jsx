import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Dashboard from './components/Dashboard';
import EventFeed from './components/EventFeed';
import QueueList from './components/QueueList';
import { Box, Container, Grid, Typography, AppBar, Toolbar } from '@mui/material';
import { motion } from 'framer-motion';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:5000';

function App() {
  const [matchEvents, setMatchEvents] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [queues, setQueues] = useState({});
  const [crowds, setCrowds] = useState({});

  useEffect(() => {
    const socket = io(WS_URL);

    socket.on('connect', () => {
      console.log('Connected to VenueFlow live socket');
    });

    socket.on('match_events', (data) => {
      setMatchEvents(prev => [data, ...prev].slice(0, 10)); // keep last 10
    });

    socket.on('alerts', (data) => {
      setAlerts(prev => [data, ...prev].slice(0, 5));
    });

    socket.on('queue_updates', (data) => {
      try {
        const payload = typeof data === 'string' ? JSON.parse(data) : data;
        setQueues(prev => ({
          ...prev,
          [`${payload.serviceType}:${payload.serviceId}`]: payload.estimatedWaitMs
        }));
      } catch(e) {}
    });

    socket.on('crowd_updates', (data) => {
      try {
        const payload = typeof data === 'string' ? JSON.parse(data) : data;
        setCrowds(prev => ({
          ...prev,
          [`${payload.locationType}:${payload.locationId}`]: payload.density
        }));
      } catch(e) {}
    });

    return () => socket.disconnect();
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', pb: 4, pt: 10 }}>
      {/* App Bar / Header */}
      <AppBar position="fixed" elevation={0} sx={{ background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            <Typography variant="h5" fontWeight="bold" sx={{ background: 'linear-gradient(to right, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
              VenueFlow Cricket
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <motion.div
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }}
              />
              <Typography variant="caption" color="text.secondary" fontWeight="bold">
                LIVE STADIUM SYNC
              </Typography>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Main Content Dashboard */}
      <Container maxWidth="xl">
        <Grid container spacing={3}>
          {/* Left Column */}
          <Grid item xs={12} md={8}>
            <Box display="flex" flexDirection="column" gap={3}>
              <Dashboard crowds={crowds} />
              <QueueList queues={queues} />
            </Box>
          </Grid>
          
          {/* Right Column */}
          <Grid item xs={12} md={4}>
             <EventFeed events={matchEvents} alerts={alerts} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default App;
