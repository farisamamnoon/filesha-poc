import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { appConfig } from "../../config";

@Injectable()
export class MimeTypeInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const file = request.file;

    if (!file) {
      throw new BadRequestException("File is required.");
    }

    const allowedMimetypes = appConfig.ALLOWED_MIMETYPES;
    if (!allowedMimetypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type "${file.mimetype}". Allowed types: ${allowedMimetypes.join(", ")}`
      );
    }

    return next.handle();
  }
}
