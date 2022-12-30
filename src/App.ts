import express, { Express, Router } from 'express';
import bodyParser from 'body-parser';
import 'express-async-errors';

import api from './api';

class App {
  public express: Express;
  public api: Router;

  constructor() {
    this.express = express();
    this.api = api;

    this.mountMiddleware();
    this.mountRoutes();
  }

  private mountRoutes(): void {
    const router = Router();

    router.get('/', (req, res) => {
      res.json({
        message: 'Hello World!',
      });
    });

    this.express.use('/', router);
    this.express.use('/rest', this.api);
  }

  private mountMiddleware(): void {
    this.express.use(bodyParser.urlencoded({ extended: false }));
    this.express.use(bodyParser.json());
  }
}

export default function app() {
  return new App().express;
}
