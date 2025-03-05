import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// import configuration from './config';
import { validationSchema } from './config';
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
})
export class CoreModule {}
