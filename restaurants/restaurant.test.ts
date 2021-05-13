import 'jest';
import * as request from 'supertest';

let address: string = (<any>global).address;
let auth: string = (<any>global).auth;
let id: string;

beforeAll(() => {
  return request(address)
    .post('/restaurants')
    .set('Authorization', auth)
    .send({
      name: 'Restaurante Teste'
    }).then(response => {
      id = response.body._id;
    })
    .catch(fail);
})

test('GET /restaurants', () => {
  return request(address)
    .get('/restaurants')
    .then(response => {
      expect(response.status).toBe(200);
      expect(response.body.items).toBeInstanceOf(Array);
    }).catch(fail);
});

test('GET /restaurants/:id 200', () => {
  return request(address)
    .get(`/restaurants/${id}`)
    .then(response => {
      expect(response.status).toBe(200);
      expect(response.body._id).toBeDefined();
      expect(response.body.name).toBe('Restaurante Teste');
    }).catch(fail);
});

test('GET /restaurants/:id 404', () => {
  return request(address)
    .get('/restaurants/aaa')
    .then(response => {
      expect(response.status).toBe(404);
    }).catch(fail);
});

test('POST /restaurants', () => {
  return request(address)
    .post('/restaurants')
    .set('Authorization', auth)
    .send({
      name: 'Lanchonete Teste'
    }).then(response => {
      expect(response.status).toBe(200);
      expect(response.body._id).toBeDefined();
      expect(response.body.name).toBe('Lanchonete Teste');
    }).catch(fail);
});

test('PUT /restaurants/:id', () => {
  return request(address)
    .put(`/restaurants/${id}`)
    .set('Authorization', auth)
    .send({
      name: 'Restaurante Updated'
    }).then(response => {
      expect(response.status).toBe(200);
      expect(response.body._id).toBeDefined();
      expect(response.body.name).toBe('Restaurante Updated');
    }).catch(fail);
});

test('PATCH /restaurants/:id', () => {
  return request(address)
    .patch(`/restaurants/${id}`)
    .set('Authorization', auth)
    .send({
      name: 'Restaurante Patched'
    }).then(response => {
      expect(response.status).toBe(200);
      expect(response.body._id).toBeDefined();
      expect(response.body.name).toBe('Restaurante Patched');
    }).catch(fail);
});

test('GET /restaurants/:id/menu', () => {
  return request(address)
    .get(`/restaurants/${id}/menu`)
    .then(response => {
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
    }).catch(fail);
});

test('PUT /restaurants/:id/menu', () => {
  return request(address)
    .put(`/restaurants/${id}/menu`)
    .set('Authorization', auth)
    .send([
      {
        name: 'Dogão',
        price: 16
      },
      {
        name: 'Prensado',
        price: 16
      }
    ])
    .then(response => {
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body[0].name).toBe('Dogão');
      expect(response.body[0].price).toBe(16);
      expect(response.body[1].name).toBe('Prensado');
      expect(response.body[1].price).toBe(16);
    }).catch(fail);
});

test('DELETE /restaurants/:id', () => {
  return request(address)
    .delete(`/restaurants/${id}`)
    .set('Authorization', auth)
    .then(response => {
      expect(response.status).toBe(204);
    }).catch(fail);
});
