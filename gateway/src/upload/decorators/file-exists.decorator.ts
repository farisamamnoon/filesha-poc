import { UseInterceptors, applyDecorators } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { FileExistsInterceptor } from "../interceptors/file-exists.interceptor";

export function FileInterceptAndCheckExists() {
  return applyDecorators(
    UseInterceptors(FileInterceptor("file"), FileExistsInterceptor),
  );
}
