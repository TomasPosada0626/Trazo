// Author: Mateo Garcia Carreno

// external imports
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// internal imports
import { User } from './entities/user.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
})
export class UsersModule {}
