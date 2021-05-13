import * as mongoose from 'mongoose';
import { validateCPF, validateEmail } from '../common/validators';
import * as bcrypt from 'bcryptjs';
import { environment } from '../common/environment';
import { Next } from 'restify';

export interface User extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  gender: string;
  cpf: string;
  profiles: string[];
  matches(password: string): boolean;
  hasAny(...profiles: string[]): boolean;
}

export interface UserModel extends mongoose.Model<User> {
  findByEmail(email: string, projection?: string): Promise<User>;
}

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 80,
    minlength: 3,
  },
  email: {
    type: String,
    unique: true,
    match: validateEmail,
    required: true,
  },
  password: {
    type: String,
    select: false,
    required: true,
  },
  gender: {
    type: String,
    required: false,
    enum: ['Male', 'Female'],
  },
  cpf: {
    type: String,
    required: false,
    validate: {
      validator: validateCPF,
      message: '{PATH}: Invalid CPF ({VALUE})'
    },
  },
  profiles: {
    type: [String],
    required: false,
  }
});

userSchema.statics.findByEmail = function (email: string, projection: string) {
  return this.findOne({ email }, projection);
}

userSchema.methods.matches = function (password: string): boolean {
  return bcrypt.compareSync(password, this.password);
}

userSchema.methods.hasAny = function (...profiles: string[]): boolean {
  return profiles.some(profile => this.profiles.indexOf(profile) !== -1);
}

const hashPassword = (obj: User, next: Next) => {
  bcrypt.hash(obj.password, environment.security.salt)
    .then(hash => {
      obj.password = hash
      next()
    }).catch(next)
}

const saveMiddleware = function (this: any, next: any) {
  const user: User = this
  if (!user.isModified('password')) {
    next()
  } else {
    hashPassword(user, next)
  }
}

const updateMiddleware = function (this: any, next: any) {
  if(!this.getUpdate().password) {
    next()
  } else {
    hashPassword(this, next)
  }
}

userSchema.pre('save', saveMiddleware)

userSchema.pre('findOneAndUpdate', updateMiddleware)

export const User = mongoose.model<User, UserModel>('User', userSchema);