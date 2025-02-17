// Core Imports

import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Client } from 'pg';
import * as bcrypt from 'bcrypt';

// Code Imports

import { User } from '../../entities/user.entity';
import {
  CreateUserRequest,
  UpdateUserRequest,
} from '../../requests/user.request';

@Injectable()
export class UsersService {
  constructor(
    private configService: ConfigService,
    @Inject('PG') private clientPg: Client,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  findAll() {
    return this.userRepo.find();
  }

  async findOne(document: string) {
    const user = await this.userRepo.findOne(document);
    if (!user) {
      throw new NotFoundException(`User #${document} not found`);
    }
    return user;
  }

  findByEmail(email: string){
    return this.userRepo.findOne({ where: { email } });
  }

  async create(data: CreateUserRequest) {
    const newUser = this.userRepo.create(data);
    const hashPassword = await bcrypt.hash(newUser.password, 10);
    newUser.password = hashPassword;
    return this.userRepo.save(newUser);
  }

  async update(document: string, changes: UpdateUserRequest) {
    const user = await this.findOne(document);
    this.userRepo.merge(user, changes);
    return this.userRepo.save(user);
  }

  remove(document: string) {
    return this.userRepo.delete(document);
  }
}
