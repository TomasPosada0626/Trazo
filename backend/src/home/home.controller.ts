import { Controller, Get } from '@nestjs/common';

@Controller()
export class HomeController {
  @Get()
  index(): string {
    return 'API is running';
  }
}
