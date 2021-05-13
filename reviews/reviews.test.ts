import 'jest';
import * as request from 'supertest';

let address: string = (<any>global).address;
let auth: string = (<any>global).auth;
let restaurantId: string;
let userId: string;
let reviewId: string;

beforeAll(() => {
  return request(address)
    .post('/restaurants')
    .set('Authorization', auth)
    .send({
      name: 'Burguer House'
    }).then(response => {
      restaurantId = response.body._id;
    }).catch(fail);
});

beforeAll(() => {
  return request(address)
    .post('/users')
    .set('Authorization', auth)
    .send({
      name: 'Any User',
      email: 'anyuser@email.com',
      password: 'anyuser2test'
    }).then(response => {
      userId = response.body._id;
    }).catch(fail);
});

beforeAll(() => {
  return request(address)
    .post('/reviews')
    .set('Authorization', auth)
    .send({
      date: '2021-05-12',
      rating: 4,
      comments: 'I liked it, but my children did not enjoy it as much',
      restaurant: restaurantId,
      user: userId
    }).then(response => reviewId = response.body._id)
    .catch(fail);
})

test('GET /reviews', () => {
  return request(address)
    .get('/reviews')
    .then(response => {
      expect(response.status).toBe(200);
      expect(response.body.items).toBeInstanceOf(Array);
    }).catch(fail);
});

test('POST /reviews', () => {
  return request(address)
    .post('/reviews')
    .set('Authorization', auth)
    .send({
      date: '2021-05-12',
      rating: 5,
      comments: 'I really liked the experience',
      restaurant: restaurantId,
      user: userId
    }).then(response => {
      expect(response.status).toBe(200);
      expect(response.body._id).toBeDefined();
      expect(response.body.date).toBe('2021-05-12T00:00:00.000Z');
      expect(response.body.rating).toBe(5);
      expect(response.body.comments).toBe('I really liked the experience');
      expect(response.body.restaurant).toBe(restaurantId);
      expect(response.body.user).toBe(userId);
    }).catch(fail);
});

test('GET /reviews/:id 200', () => {
  return request(address)
    .get(`/reviews/${reviewId}`)
    .then(response => {
      expect(response.status).toBe(200);
      expect(response.body.restaurant.name).toBe('Burguer House');
      expect(response.body.user.name).toBe('Any User');
    }).catch(fail);
});

test('GET /reviews/:id 404', () => {
  return request(address)
    .get('/reviews/aaa')
    .then(response => expect(response.status).toBe(404))
    .catch(fail);
});
