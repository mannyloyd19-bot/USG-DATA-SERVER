const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./modules/auth/routes/auth.routes');
const collectionRoutes = require('./modules/collections/routes/collection.routes');
const fieldRoutes = require('./modules/fields/routes/field.routes');

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'USG DATA SERVER running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/collections/:collectionKey/fields', fieldRoutes);

module.exports = app;
