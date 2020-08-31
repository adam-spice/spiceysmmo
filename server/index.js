import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import passport from 'passport';

import routes from './routes/main';
import passwordRoutes from './routes/password';
import secureRoutes from './routes/secure';
import './auth/auth';

// setup mongo connection
const uri = process.env.MONGO_CONNECTION_URL;
const mongoConfig = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
};
if (process.env.MONGO_USERNAME && process.env.MONGO_PASSWORD) {
  mongoConfig.auth = { authSource: 'admin' };
  mongoConfig.user = process.env.MONGO_USERNAME;
  mongoConfig.pass = process.env.MONGO_PASSWORD;
}
mongoose.connect(uri, mongoConfig);

mongoose.connection.on('error', (error) => {
  console.log(error);
  process.exit(1);
});

mongoose.set('useFindAndModify', false);

const app = express();
const PORT = process.env.PORT || 3000;

// update express settings
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors({ credentials: true, origin: process.env.CORS_ORIGIN }));
app.use(cookieParser());

// import passport strategies
app.get('/game.html', passport.authenticate('jwt', { session: false }), (req, res) => {
  return res.status(200).json(req.user);
});

app.use(express.static(`${__dirname}/public`));

app.get('/', (req, res) => {
  res.send(`${__dirname}/index.html`);
});

// setup routes
app.use('/', routes);
app.use('/', passwordRoutes);
app.use('/', passport.authenticate('jwt', { session: false }), secureRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: '404 - Not Found', status: 404 });
});

// error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ error: err.message, status: 500 });
  console.error(err);
});

mongoose.connection.on('connected', () => {
  console.log('connected to mongo');
  app.listen(PORT, () => {
    console.log(`The server is running on port ${PORT}`);
  });
});
