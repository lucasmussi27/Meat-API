import * as restify from 'restify';
import * as mongoose from 'mongoose';
import { environment } from '../common/environment';
import { Router } from '../common/router';
import { mergePatchBodyParser } from './merge-patch.parser';
import { handleError } from './error.handler';
import { tokenParser } from '../security/token.parser';
import * as fs from 'fs';
import { logger } from '../common/logger';

export class Server {

  application: restify.Server;

  initDatabase(): mongoose.MongooseThenable {
    (<any>mongoose.Promise) = global.Promise;
    return mongoose.connect(environment.database.url, {
      useMongoClient: true,
    });
  }

  initRoutes(routers: Router[]): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const options: restify.ServerOptions = {
          name: 'meat-api',
          version: '1.0.0',
          log: logger
        }

        if(environment.security.enableHTTPS) {
          options.certificate = fs.readFileSync(environment.security.certificate),
          options.key = fs.readFileSync(environment.security.key)
        }

        this.application = restify.createServer(options);

        this.application.pre(restify.plugins.requestLogger({
          log: logger
        }));
        
        this.application.use(restify.plugins.bodyParser());
        this.application.use(restify.plugins.queryParser());
        this.application.use(mergePatchBodyParser);
        this.application.use(tokenParser);

        // routes
        for (let router of routers) {
          router.applyRoutes(this.application);
        }

        this.application.get('/info', [
          (request, response, next) => {
            if (request.userAgent() && request.userAgent().includes("MSIE 7.0")) {
              let error: any = new Error();
              error.statusCode = 400;
              error.message = 'Please, update your browser!';
              return next(error);
            }
            return next();
          }, 
          (request, response, next) => {
            response.json({
              browser: request.userAgent(),
              method: request.method,
              url: request.href(),
              path: request.path(),
              query: request.query,
            });
            return next();
          }
        ]);

        this.application.listen(environment.server.port, () => {
          resolve(this.application);
        });

        this.application.on('restifyError', handleError);
        
      } catch (error) {
        reject(error);
      }
    });
  }

  bootstrap(routers: Array<Router> = []): Promise<Server> {
    return this.initDatabase().then(() => 
      this.initRoutes(routers).then(() => this));
  }

  shutdown() {
    return mongoose.disconnect().then(() => this.application.close());
  }
}
