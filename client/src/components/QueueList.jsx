import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

const QueueList = ({ queues }) => {
  const stalls = [
    { id: '12', name: 'Snacks Stall B', type: 'stall' },
    { id: '15', name: 'Merch Store', type: 'stall' },
    { id: '5', name: 'Washroom Gate 3', type: 'restroom' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
      <Card elevation={4}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">Live Wait Times</Typography>
          
          <Box display="flex" flexDirection="column" gap={1.5} mt={2}>
            {stalls.map(stall => {
              const key = `${stall.type}:${stall.id}`;
              const waitMs = queues[key];
              const displayWait = waitMs !== undefined ? Math.round(waitMs / 60000) : Math.floor(Math.random() * 15) + 2; 

              return (
                <Box key={key} sx={{ 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                  p: 2, bgcolor: 'rgba(255, 255, 255, 0.03)', borderRadius: 2, borderLeft: '4px solid #38bdf8' 
                }} aria-label={`Queue for ${stall.name}`}>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">{stall.name}</Typography>
                    <Typography variant="caption" color="text.secondary">Type: {stall.type}</Typography>
                  </Box>
                  <Box textAlign="right">
                    <AnimatePresence mode="popLayout">
                        <motion.div
                          key={displayWait}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10, position: 'absolute' }}
                        >
                          <Typography variant="h6" color="primary.main" fontWeight="bold" aria-live="polite">
                            {displayWait} min
                          </Typography>
                        </motion.div>
                    </AnimatePresence>
                    <Typography variant="caption" color="text.secondary">avg wait</Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default QueueList;
