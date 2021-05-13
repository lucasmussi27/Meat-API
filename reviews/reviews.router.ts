import { Next, Request, Response, Server } from 'restify';
import { DocumentQuery } from 'mongoose';
import { ModelRouter } from '../common/model-router';
import { Review } from './reviews.model';
import { authorize } from '../security/authz.handler';

class ReviewsRouter extends ModelRouter<Review> {
  constructor() {
    super(Review);
  }

  envelope(document: any) {
    let resource = super.envelope(document);
    const restaurantId = document.restaurant._id 
      ? document.restaurant._id 
      : document.restaurant;
    const userId = document.user._id 
      ? document.user._id 
      : document.user;
    resource._links.restaurant = `/restaurants/${restaurantId}`;
    resource._links.user = `/users/${userId}`;
    return resource;
  }

  protected prepareOne(query: DocumentQuery<Review | null, Review>): DocumentQuery<Review | null,Review> {
    return query
        .populate('restaurant', 'name')
        .populate('user', 'name');
  }

  findById = (request: Request, response: Response, next: Next) => {
    this.model.findById(request.params.id)
        .populate('restaurant', 'name')
        .populate('user', 'name')
        .then(this.render(response, next))
        .catch(next);
  }

  applyRoutes(application: Server) {
    application.get('/reviews', this.findAll);
    application.get('/reviews/:id', [
      this.validateId, 
      this.findById
    ]);
    application.post('/reviews', [
      authorize('user'), 
      this.addOne
    ]);
  }
}

export const reviewsRouter = new ReviewsRouter();
