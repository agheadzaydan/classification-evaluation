import { Module } from '@nestjs/common';
import { ClassificationController } from './classification/classification.controller';
import { ClassificationService } from './classification/classification.service';

@Module({
  controllers: [ClassificationController],
  providers: [ClassificationService],
})
export class AppModule {}