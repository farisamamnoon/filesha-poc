import { Controller } from '@nestjs/common';
import { GrpcMethod, GrpcStreamCall } from '@nestjs/microservices';
import { UploadService } from './upload.service';
import {
  UploadServiceController,
  UploadResponse,
  DoesExistRequest,
  DoesExistResponse,
} from './types/digital';

@Controller()
export class UploadController {
  constructor(private readonly uploadService: UploadService) { }

  @GrpcStreamCall('UploadService', 'Upload')
  upload(requestStream: any, callback: (err: any, value: UploadResponse) => void) {
    this.uploadService.uploadStream(requestStream, callback);
  }

  @GrpcMethod('UploadService', 'DoesExist')
  async doesExist(request: DoesExistRequest): Promise<DoesExistResponse> {
    return this.uploadService.doesExist(request);
  }
}
