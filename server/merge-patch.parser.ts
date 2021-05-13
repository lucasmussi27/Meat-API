import * as restify from 'restify';
import { BadRequestError } from 'restify-errors';

const mpContentType = 'application/merge-patch+json';

export const mergePatchBodyParser = (
  request: restify.Request, 
  response: restify.Response, 
  next: restify.Next
) => {
  if (request.getContentType() === mpContentType && request.method === 'PATCH') {
    (<any>request).rawBody = request.body;
    try {
      request.body = JSON.parse(request.body);
    } catch (error) {
      return next(new BadRequestError(`Invalid Content: ${error.message}`));
    }
  }
  return next();
}