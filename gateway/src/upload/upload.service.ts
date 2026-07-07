import {
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
} from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";
import { Observable } from "rxjs";
import { UploadServiceClient, DoesExistRequest, DoesExistResponse, UploadRequest, UploadResponse } from "./types/digital";

@Injectable()
export class UploadService implements OnModuleInit {
  private readonly logger = new Logger(UploadService.name);

  private uploadServiceClient: UploadServiceClient;

  constructor(
    @Inject("DIGITAL_PACKAGE") private digitalClient: ClientGrpc,
  ) { }

  onModuleInit() {
    this.uploadServiceClient =
      this.digitalClient.getService<UploadServiceClient>("UploadService");
  }

  async doesExist(
    data: DoesExistRequest,
  ): Promise<Observable<DoesExistResponse>> {
    try {
      return this.uploadServiceClient.doesExist(data);
    } catch (error) {
      throw new Error(`Failed to check existence: ${error.message}`);
    }
  }

  async upload(
    requestStream: Observable<UploadRequest>,
  ): Promise<Observable<UploadResponse>> {
    try {
      return this.uploadServiceClient.upload(requestStream);
    } catch (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }
}
