import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { EvaluationRequest, EvaluationResponse } from '../proto/classification';
import { ClassificationService } from './classification.service';

@Controller()
export class ClassificationController {
  constructor(private readonly classificationService: ClassificationService) {}

  @GrpcMethod('ClassificationService', 'EvaluateClassification')
  evaluateClassification(request: EvaluationRequest): Promise<EvaluationResponse> {
    return this.classificationService.evaluateClassification(request);
  }
}