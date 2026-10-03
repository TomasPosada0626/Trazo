// Author: Mateo Garcia Carreno

// external imports
import { Module } from '@nestjs/common';

// internal imports
import { HomeController } from './home.controller.js';

@Module({
  controllers: [HomeController],
})
export class HomeModule {}
