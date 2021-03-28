import express from 'express';
import exhbs from 'express-handlebars';
import bodyParser from 'body-parser';
import cors from 'cors';
import http from 'http';
import socketIo from 'socket.io';
import morgan from 'morgan';
import { AddressInfo } from 'net';
import path from 'path';

import { APP_PORT } from './config/app';
import { connectToMongoose } from './models';
import { initPassport } from './passport';
import { initSockets } from './sockets';
import { initSession } from './session';

(async function runApp(): Promise<void> {
  try {
    const app = express();
    const server = new http.Server(app);

    // Add basic middlewares
    app.use(cors());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use(morgan('combined'));

    // Add templating engine
    // Add your config here
    const hbs = exhbs.create({
      helpers: {},
    });

    // Add new engine to ExpressJS
    app.engine('handlebars', hbs.engine);

    // Set chosen view engine
    app.set('view engine', 'handlebars');

    // Set views path
    app.set('views', 'views');

    // Static dir
    app.use(express.static(path.join(__dirname, 'public')));

    const sessionMiddleware = initSession(app);
    const passport = initPassport(app);

    // Connect to the database
    await connectToMongoose();

    const io = socketIo(server);
    initSockets(io, sessionMiddleware);

    // Endpoints below
    app.post(
      '/login',
      passport.authenticate('local', { failureRedirect: '/' }),
      (req, res) => {
        res.redirect('/');
      }
    );

    // 404 supports
    app.use((req, res) => {
      res.status(404).json({
        message: 'Not found',
        status: 404,
      });
    });

    const serverInstance = server.listen(APP_PORT, () => {
      console.log(
        `Listening on port ${(serverInstance.address() as AddressInfo).port}`
      );
    });
  } catch (err) {
    console.log('Problems initializing the app', err);
    process.exit(1);
  }
})();
