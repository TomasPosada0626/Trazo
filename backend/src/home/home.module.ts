// Developed by Mateo Garcia Carreno

// External imports
import { Module } from '@nestjs/common';

// Internal imports
import { HomeController } from './home.controller.js';

@Module({
  controllers: [HomeController],
})
export class HomeModule {}
