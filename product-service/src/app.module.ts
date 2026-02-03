import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { getEnvPath } from './env/env.helper';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductModule } from './modules/product/product.module';

const parentDir = join(__dirname, '..');
const envFilePath: string = getEnvPath(parentDir);

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath, isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URI'),
      }),
    }),
    ProductModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
