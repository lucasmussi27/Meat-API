import * as jwt from 'jsonwebtoken';
import { RequestHandler } from "restify";
import { NotAuthorizedError } from "restify-errors";
import { environment } from '../common/environment';
import { User } from "../users/users.model";

export const authenticate: RequestHandler = (request, response, next) => {
  const { email, password } = request.body;
  User.findByEmail(email, '+password')
    .then(user => {
      if(user && user.matches(password)) {
        const token = jwt.sign(
          { sub: user.email, iss: 'meat-api' }, 
          environment.security.secret,
          { expiresIn: '1h' }
        );
        response.json({
          name: user.name,
          email: user.email,
          accessToken: token
        });
        return next(false);
      } else {
        return next(new NotAuthorizedError("Invalid credentials"));
      }
    }).catch(next);
}
