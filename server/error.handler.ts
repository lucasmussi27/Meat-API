import * as restify from 'restify';

export const handleError = (
  request: restify.Request, 
  response: restify.Response, 
  error: any, 
  done: any
) => {
  error.toJSON = () => {
    return {
      message: error.message
    }
  }

  switch (error.name) {
    case 'MongoError':
      if (error.code === 11000) {
        error.statusCode = 400;
      }
      break;
    case 'ValidationError':
      error.statusCode = 400
      const messages: Array<any> = []
      for (let name in error.errors) {
        messages.push({ 
          message: error.errors[name].message 
        })
      }
      error.toJSON = () => ({
        message: 'Validation error while processing your request',
        errors: messages
      });
      break;
  }

  done();
}