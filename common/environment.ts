export const environment = {
  server: { port: process.env.SERVER_PORT || 3000 },
  database: { url: process.env.DB_URL || 'mongodb://localhost/meat-api' },
  security: { 
    salt: process.env.SALT || 10,
    secret: process.env.API_SECRET || 'N1rv4n4D3v',
    enableHTTPS: process.env.ENABLE_HTTPS || false,
    certificate: process.env.CERTIFICATE_FILE || './security/keys/cert.pem',
    key: process.env.KEY_FILE || './security/keys/key.pem'
  },
  log: {
    level: process.env.LOG_LEVEL || 'debug',
    name: 'meat-api-logger'
  }
};
