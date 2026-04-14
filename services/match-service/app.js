const express = require('express');
const cors = require('cors');
const matchRoutes = require('./routes/match.routes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/', matchRoutes);

module.exports = app;
