const express = require('express');
const cors = require('cors');
const crowdRoutes = require('./routes/crowd.routes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/', crowdRoutes);

module.exports = app;
