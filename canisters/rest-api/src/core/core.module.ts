import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
// import { APP_INTERCEPTOR } from '@nestjs/core';
import { APP_FILTER } from '@nestjs/core';

// import configuration from './config';
import { validationSchema } from './config';
// import { ResponseInterceptor } from './response.interceptor';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { HealthModule } from '../health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      // TODO: Load configuration don't work on Azle
      // load: [configuration],
      validationSchema,
    }),
    HealthModule,
  ],
  providers: [
    // TODO: Interceptor don't work on Azle yet
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: ResponseInterceptor,
    // },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class CoreModule {}
