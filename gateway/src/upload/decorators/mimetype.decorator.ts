import { UseInterceptors, applyDecorators } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { MimeTypeInterceptor } from "../interceptors/mimetype.interceptor";

export function ValidateMimeType() {
  return applyDecorators(UseInterceptors(FileInterceptor("file"), MimeTypeInterceptor));
}
