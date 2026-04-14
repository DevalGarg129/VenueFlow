import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

const EventFeed = ({ events, alerts }) => {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
      <Card elevation={4} sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">Live Updates</Typography>
          
          {alerts.length > 0 && (
            <Box mb={3}>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 1, display: 'block' }}>
                Safety Alerts
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                <AnimatePresence>
                  {alerts.map((alert, i) => {
                    const data = typeof alert === 'string' ? JSON.parse(alert) : alert;
                    return (
                      <motion.div 
                        key={data.timestamp || i}
                        initial={{ opacity: 0, height: 0, mb: 0 }}
                        animate={{ opacity: 1, height: 'auto', mb: 8 }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <Box sx={{ p: 2, bgcolor: 'rgba(239, 68, 68, 0.05)', borderLeft: '4px solid #ef4444', borderRadius: 1 }} role="alert" aria-live="assertive">
                          <Chip size="small" color="error" label="CRITICAL" sx={{ mb: 1, height: 20, fontSize: '0.65rem' }} />
                          <Typography variant="body2">{data.message}</Typography>
                        </Box>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </Box>
            </Box>
          )}

          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 1, display: 'block' }}>
              Match Events
            </Typography>
            {events.length === 0 && <Typography variant="body2" color="text.secondary" fontStyle="italic">Waiting for match actions...</Typography>}
            
            <Box display="flex" flexDirection="column" gap={1}>
              <AnimatePresence>
                {events.map((event, i) => {
                  const data = typeof event === 'string' ? JSON.parse(event) : event;
                  return (
                    <motion.div 
                        key={data.timestamp || i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                      <Box sx={{ p: 2, bgcolor: 'rgba(16, 185, 129, 0.05)', borderLeft: '4px solid #10b981', borderRadius: 1 }} role="log" aria-live="polite">
                        <Chip size="small" color="success" label={data.type.toUpperCase()} sx={{ mb: 1, height: 20, fontSize: '0.65rem' }} />
                        <Typography variant="subtitle2" fontWeight="bold">{data.player}</Typography>
                        <Typography variant="body2" color="text.secondary">{data.detail}</Typography>
                      </Box>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </Box>
          </Box>
          
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EventFeed;
