import * as jestCli from 'jest-cli';
import { environment } from "./common/environment";
import { Restaurant } from "./restaurants/restaurant.model";
import { restaurantsRouter } from "./restaurants/restaurant.router";
import { Review } from "./reviews/reviews.model";
import { reviewsRouter } from "./reviews/reviews.router";
import { Server } from "./server/server";
import { User } from "./users/users.model";
import { usersRouter } from "./users/users.router";

let server: Server;
const beforeAllTests = () => {
  environment.database.url = process.env.DB_URL || 'mongodb://localhost/meat-api-test';
  environment.server.port = process.env.SERVER_PORT || 3001;
  server = new Server();
  return server.bootstrap([
      usersRouter,
      restaurantsRouter,
      reviewsRouter
    ])
    .then(() => User.remove({}).exec())
    .then(() => {
      let admin = new User();
      admin.name = 'admin test';
      admin.email = 'testadmin@email.com';
      admin.password = 'admin4tests';
      admin.profiles = ['admin', 'user'];
      return admin.save();
    })
    .then(() => Restaurant.remove({}).exec())
    .then(() => Review.remove({}).exec())
    .catch(console.error);
}

const afterAllTests = () => {
  return server.shutdown();
}

beforeAllTests()
  .then(() => jestCli.run())
  .then(() => afterAllTests())
  .catch(console.error);
