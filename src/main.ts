import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      url: '0.0.0.0:50051', // gRPC server address
      package: 'classification', // Must match the package name in the .proto file
      protoPath: join(__dirname, '../proto/classification.proto'), // Path to your .proto file
    },
  });

  await app.listen();
}

bootstrap();


// "postbuild": "shx mkdir -p dist/proto && shx cp -r proto/* dist/proto",