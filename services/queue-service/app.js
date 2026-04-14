const express = require('express');
const cors = require('cors');
const queueRoutes = require('./routes/queue.routes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/', queueRoutes);

module.exports = app;
