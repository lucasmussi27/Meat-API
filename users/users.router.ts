import { Next, Request, Response, Server } from 'restify';
import { ModelRouter } from '../common/model-router';
import { authenticate } from '../security/auth.handler';
import { authorize } from '../security/authz.handler';
import { User } from './users.model';

class UsersRouter extends ModelRouter<User> {
  constructor() {
    super(User);
    this.on('beforeRender', document => {
      document.password = undefined;
    });
  }

  findByEmail = (request: Request, response: Response, next: Next) => {
    request.query.email
      ? User.findByEmail(request.query.email)
          .then(user => user ? [user] : [])
          .then(this.renderAll(response, next, {
            pageSize: this.pageSize,
            url: request.url
          }))
          .catch(next)
      : next();
  }

  applyRoutes(application: Server) {
    application.get({path: `${this.basePath}`, version: '1.0.0'}, [
      authorize('admin'), 
      this.findAll
    ]);
    application.get({path: `${this.basePath}`, version: '2.0.0'}, [
      authorize('admin'), 
      this.findByEmail, 
      this.findAll
    ]);
    application.get(`${this.basePath}/:id`, [
      authorize('admin'), 
      this.validateId, 
      this.findById
    ]);
    application.post(`${this.basePath}`, [
      authorize('admin'),
      this.addOne
    ]);
    application.put(`${this.basePath}/:id`, [
      authorize('admin'), 
      this.validateId, 
      this.replaceOne
    ]);
    application.patch(`${this.basePath}/:id`, [
      authorize('admin'), 
      this.validateId, 
      this.editOne
    ]);
    application.del(`${this.basePath}/:id`, [
      authorize('admin'), 
      this.validateId, 
      this.deleteOne
    ]);
    application.post(`${this.basePath}/authenticate`, authenticate);
  }
}

export const usersRouter = new UsersRouter();
