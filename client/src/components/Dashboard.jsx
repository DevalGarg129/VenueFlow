import React from 'react';
import { Card, CardContent, Typography, Grid, Box } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = ({ crowds }) => {
  const stands = [
    { id: 'North', capacity: 15000 },
    { id: 'South', capacity: 12000 },
    { id: 'Pavilion', capacity: 5000 }
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card elevation={4}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">Stadium Density Heatmap</Typography>
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {stands.map(stand => {
              const density = crowds[`stand:${stand.id}`] || Math.floor(Math.random() * 8000); // Fake initial load
              const percentage = Math.min(100, Math.round((density / stand.capacity) * 100));
              
              let statusColor = '#10b981'; // success
              if (percentage > 60) statusColor = '#f59e0b'; // warning
              if (percentage > 85) statusColor = '#ef4444'; // danger

              return (
                <Grid item xs={12} sm={4} key={stand.id} aria-label={`${stand.id} Stand Density`}>
                  <motion.div whileHover={{ y: -5 }}>
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      bgcolor: 'rgba(255,255,255,0.05)', 
                      borderTop: `4px solid ${statusColor}`,
                      transition: '0.3s'
                    }}>
                      <Typography variant="subtitle1" fontWeight="bold">{stand.id} Stand</Typography>
                      
                      {/* Animated Number Change */}
                      <AnimatePresence mode="popLayout">
                        <motion.div
                          key={percentage}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, position: 'absolute' }}
                          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                        >
                          <Typography variant="h3" fontWeight="bold" sx={{ my: 1 }} aria-live="polite">
                            {percentage}%
                          </Typography>
                        </motion.div>
                      </AnimatePresence>

                      <Typography variant="caption" color="text.secondary">
                        {density} / {stand.capacity} Fans
                      </Typography>
                    </Box>
                  </motion.div>
                </Grid>
              );
            })}
          </Grid>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Dashboard;
