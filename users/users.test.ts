import 'jest';
import * as request from 'supertest';

let address: string = (<any>global).address;
let auth: string = (<any>global).auth;

test('GET /users', () => {
  return request(address)
    .get('/users')
    .set('Authorization', auth)
    .then(response => {
      expect(response.status).toBe(200);
      expect(response.body.items).toBeInstanceOf(Array);
    }).catch(fail);
});

test('GET /users/:id 200', () => {
  return request(address)
    .post('/users')
    .set('Authorization', auth)
    .send({
      name: 'user2get',
      email: 'user2get@email.com',
      password: 'user2gettest',
    }).then(response => {
      return request(address)
        .get(`/users/${response.body._id}`)
        .set('Authorization', auth);
    }).then(response => {
      expect(response.status).toBe(200);
      expect(response.body._id).toBeDefined();
      expect(response.body.name).toBe('user2get');
      expect(response.body.email).toBe('user2get@email.com');
      expect(response.body.password).toBeUndefined();
    }).catch(fail);
});

test('GET /users/:id 404', () => {
  return request(address)
    .get('/users/aaa')
    .set('Authorization', auth)
    .then(response => {
      expect(response.status).toBe(404);
    }).catch(fail);
})

test('POST /users', () => {
  return request(address)
    .post('/users')
    .set('Authorization', auth)
    .send({
      name: 'user01',
      email: 'user01@email.com',
      password: 'user01test',
      gender: 'Male',
      cpf: '962.116.531-82'
    }).then(response => {
      expect(response.status).toBe(200);
      expect(response.body._id).toBeDefined();
      expect(response.body.name).toBe('user01');
      expect(response.body.email).toBe('user01@email.com');
      expect(response.body.gender).toBe('Male');
      expect(response.body.cpf).toBe('962.116.531-82');
      expect(response.body.password).toBeUndefined();
    }).catch(fail);
});

test('PUT /users/:id', () => {
  return request(address)
    .post('/users')
    .set('Authorization', auth)
    .send({
      name: 'user2update',
      email: 'user2update@email.com',
      password: 'user2updatetest',
    }).then(response => {
      return request(address)
        .put(`/users/${response.body._id}`)
        .set('Authorization', auth)
        .send({
          name: 'userupdated',
          email: 'userupdated@email.com',
          password: 'passwordupdated',
        });
    }).then(response => {
      expect(response.status).toBe(200);
      expect(response.body._id).toBeDefined();
      expect(response.body.name).toBe('userupdated');
      expect(response.body.email).toBe('userupdated@email.com');
      expect(response.body.password).toBeUndefined();
    }).catch(fail);
})

test('PATCH /users/:id', () => {
  return request(address)
    .post('/users')
    .set('Authorization', auth)
    .send({
      name: 'user2patch',
      email: 'user2patch@email.com',
      password: 'user2patchtest',
    }).then(response => {
      return request(address)
        .patch(`/users/${response.body._id}`)
        .set('Authorization', auth)
        .send({
          name: 'userpatched',
          email: 'userpatched@email.com',
        });
    }).then(response => {
      expect(response.status).toBe(200);
      expect(response.body._id).toBeDefined();
      expect(response.body.name).toBe('userpatched');
      expect(response.body.email).toBe('userpatched@email.com');
      expect(response.body.password).toBeUndefined();
    }).catch(fail);
});

test('DELETE /users/:id', () => {
  return request(address)
    .post('/users')
    .set('Authorization', auth)
    .send({
      name: 'user2delte',
      email: 'user2delete@email.com',
      password: 'user2deletetest',
    }).then(response => {
      return request(address)
        .delete(`/users/${response.body._id}`)
        .set('Authorization', auth);
    }).then(response => {
      expect(response.status).toBe(204);
    }).catch(fail);
})
