import { Next, Request, Response } from 'restify';
import { NotFoundError } from 'restify-errors';
import * as mongoose from 'mongoose';
import { Router } from './router';

export abstract class ModelRouter<D extends mongoose.Document> extends Router {

  basePath: string;
  pageSize: number = 5;

  constructor(protected model: mongoose.Model<D>){
    super()
    this.basePath = `/${model.collection.name}`
  }

  protected prepareOne(query: mongoose.DocumentQuery<D | null,D>): mongoose.DocumentQuery<D | null,D>{
    return query
  }

  envelope(document: any): any {
    let resource = Object.assign({_links:{}}, document.toJSON());
    resource._links.self = `${this.basePath}/${resource._id}`;
    return resource;
  }

  envelopeAll(documents: any[], options: any = {}): any {
    const resource: any = {
      items: documents,
      _links: {
        self: `${options.url}`
      }
    }
    if(options.page && options.count && options.pageSize) {
      if(options.page > 1) {
        resource._links.previous = `${this.basePath}?_page=${options.page-1}`
      }
      if((options.count - (options.page * options.pageSize)) > 0) {
        resource._links.next = `${this.basePath}?_page=${options.page+1}`
      }
    }
    return resource
  }

  validateId = (request: Request, response: Response, next: Next)=>{
    if(!mongoose.Types.ObjectId.isValid(request.params.id)){
      next(new NotFoundError('Document not found'))
    }else{
      next()
    }
  }

  findAll = (request: Request, response: Response, next: Next)=>{
    let page = parseInt(request.query._page || 1)
    page = page > 0 ? page : 1;
    this.model
        .count({})
        .exec()
        .then(count => this.model.find()
            .skip((page - 1) * this.pageSize)
            .limit(this.pageSize)
            .then(this.renderAll(response, next, { 
                    page, 
                    count, 
                    pageSize: this.pageSize,
                    url: request.url
                })))
        .catch(next)
  }

  findById = (request: Request, response: Response, next: Next)=>{
    this.prepareOne(this.model.findById(request.params.id))
        .then(this.render(response, next))
        .catch(next)
  }

  addOne = (request: Request, response: Response, next: Next)=>{
    let document = new this.model(request.body)
    document.save()
        .then(this.render(response, next))
        .catch(next)
  }

  replaceOne = (request: Request, response: Response, next: Next)=>{
    const options = {runValidators: true, overwrite: true}
    this.model.update({_id: request.params.id}, request.body, options)
        .exec().then((result): any => {
      if(result.n){
        return this.prepareOne(this.model.findById(request.params.id))
      } else{
        throw new NotFoundError('Documento não encontrado')
      }
    }).then(this.render(response, next))
      .catch(next)
  }

  editOne = (request: Request, response: Response, next: Next)=>{
    const options = {runValidators: true, new : true}
    this.model.findByIdAndUpdate(request.params.id, request.body, options)
        .then(this.render(response, next))
        .catch(next)
  }

  deleteOne = (request: Request, response: Response, next: Next)=>{
    this.model.remove({_id:request.params.id}).exec().then((cmdResult: any)=>{
      if(cmdResult.result.n){
        response.send(204)
      }else{
        throw new NotFoundError('Documento não encontrado')
      }
      return next()
    }).catch(next)
  }

}
