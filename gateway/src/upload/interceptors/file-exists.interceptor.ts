import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { Observable, firstValueFrom } from "rxjs";
import * as crypto from "crypto";
import { UploadService } from "../upload.service";

@Injectable()
export class FileExistsInterceptor implements NestInterceptor {
  constructor(private readonly uploadService: UploadService) { }

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const file = request.file;

    if (!file) {
      throw new BadRequestException("File is required.");
    }

    const hash = crypto.createHash("sha256").update(file.buffer).digest("hex");

    const result = await firstValueFrom(
      await this.uploadService.doesExist({ hash }),
    );

    if (result && result.exists) {
      throw new ConflictException("File already exists in the system.");
    }

    request.fileHash = hash;

    return next.handle();
  }
}
