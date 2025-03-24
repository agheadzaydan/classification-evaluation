import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import * as dotenv from 'dotenv';


dotenv.config();

if (process.env.LANGSMITH_TRACING === 'true') {
  process.env.LANGCHAIN_TRACING = 'true';
}
async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      url: '0.0.0.0:50051', 
      package: 'classification', 
      protoPath: join(__dirname, '../proto/classification.proto'), 
    },
  });

  await app.listen();
}

bootstrap();
