import {
  BadRequestException,
  Body,
  Controller,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { firstValueFrom, ReplaySubject } from "rxjs";
import { UploadService } from "./upload.service";
import { FileInterceptAndCheckExists } from "./decorators/file-exists.decorator";
import { UploadRequest } from "./types/digital";
import { FileInterceptor } from "@nestjs/platform-express";
import * as crypto from "crypto";
import { ValidateMimeType } from "./decorators/mimetype.decorator";

@Controller("upload")
export class UploadController {
  constructor(private readonly uploadService: UploadService) { }

  @Post("/upload")
  @FileInterceptAndCheckExists()
  async upload(
    @Body("table") table: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      const CHUNK_SIZE = 64 * 1024; // 64KB chunks
      const buffer = file.buffer;
      const totalSize = buffer.length;

      const requestStream = new ReplaySubject<UploadRequest>();

      // Send metadata first
      requestStream.next({
        table: table || "default",
        fileName: file.originalname,
        contentType: file.mimetype,
        chunk: new Uint8Array(0),
      });

      // Push all chunks
      let offset = 0;
      while (offset < totalSize) {
        const end = Math.min(offset + CHUNK_SIZE, totalSize);
        const chunkSlice = new Uint8Array(buffer.subarray(offset, end));
        requestStream.next({
          table: table || "default",
          fileName: file.originalname,
          contentType: file.mimetype,
          chunk: chunkSlice,
        });
        offset = end;
      }

      requestStream.complete();

      const result = await firstValueFrom(
        await this.uploadService.upload(requestStream),
      );

      if (result.statusCode !== 200) {
        return {
          statusCode: result.statusCode,
          data: null,
          success: false,
          error: result.error,
          message: "Error uploading file",
        };
      }

      return {
        statusCode: HttpStatus.OK,
        data: { s3Url: result.s3Url },
        success: true,
        error: "",
        message: "File uploaded successfully",
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Error uploading file",
        error: error.message,
        success: false,
        data: null,
      };
    }
  }

  @Post("/does-exist")
  @ValidateMimeType()
  async checkFileExists(@UploadedFile() file: Express.Multer.File) {
    try {
      if (!file) {
        throw new BadRequestException("File is required.");
      }

      const hash = crypto
        .createHash("sha256")
        .update(file.buffer)
        .digest("hex");

      const result = await firstValueFrom(
        await this.uploadService.doesExist({ hash }),
      );

      return {
        statusCode: HttpStatus.OK,
        data: { doesFileExist: result.exists },
        error: "",
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Error uploading file",
        error: error.message,
        success: false,
        data: null,
      };
    }
  }
}
