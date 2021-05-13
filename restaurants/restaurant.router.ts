import { Next, Request, Response, Server } from 'restify';
import { NotFoundError } from 'restify-errors';
import { ModelRouter } from '../common/model-router';
import { authorize } from '../security/authz.handler';
import { Restaurant } from './restaurant.model';

class RestaurantsRouter extends ModelRouter<Restaurant> {
  constructor() {
    super(Restaurant)
  }

  envelope(document: any) {
    let resource = super.envelope(document);
    resource._links.menu = `${this.basePath}/${resource._id}/menu`;
    return resource;
  }

  findMenu = (request: Request, response: Response, next: Next) => {
    Restaurant.findById(request.params.id, '+menu')
      .then(restaurant => {
        if (!restaurant) {
          throw new NotFoundError("Restaurant not found");
        } else {
          response.json(restaurant.menu)
          return next()
        }
      }).catch(next)
  }

  replaceMenu = (request: Request, response: Response, next: Next) => {
    Restaurant.findById(request.params.id)
      .then(restaurant => {
        if (!restaurant) {
          throw new NotFoundError("Restaurant not found");
        } else {
          restaurant.menu = request.body
          return restaurant.save()
        }
      }).then(restaurant => {
        response.json(restaurant.menu)
        return next()
      }).catch(next)
  }

  applyRoutes(application: Server) {
    application.get(`${this.basePath}`, this.findAll);
    application.get(`${this.basePath}/:id`, [
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

    application.get(`${this.basePath}/:id/menu`, [
      this.validateId, 
      this.findMenu
    ]);  
    application.put(`${this.basePath}/:id/menu`, [
      authorize('admin'), 
      this.validateId, 
      this.replaceMenu
    ]);
  }
}

export const restaurantsRouter = new RestaurantsRouter();
