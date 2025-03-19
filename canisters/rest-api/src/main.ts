// import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from './app.module';
// import { ResponseInterceptor } from './core/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // TODO: ValidationPipe don't work on Azle
  // app.useGlobalPipes(new ValidationPipe());
  // TODO: ResponseInterceptor don't work on Azle?
  // app.useGlobalInterceptors(new ResponseInterceptor());
  await app.listen(3000);
}
bootstrap();
