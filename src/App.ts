import express, { Express, Router } from 'express';
import bodyParser from 'body-parser';

import api from './api';

class App {
  public express: Express;
  public api: Router;
  public rootPath: string;

  constructor(rootPath: string) {
    this.express = express();
    this.api = api;
    this.rootPath = rootPath;

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

    this.express.use('/lib', express.static(this.rootPath));
  }

  private mountMiddleware(): void {
    this.express.use(bodyParser.urlencoded({ extended: false }));
    this.express.use(bodyParser.json());
  }
}

export default function app(root: string) {
  return new App(root).express;
}
