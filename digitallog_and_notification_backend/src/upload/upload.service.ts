import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { UploadResponse, DoesExistRequest, DoesExistResponse } from './types/digital';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly uploadsDir = path.join(process.cwd(), 'uploads');
  private readonly metadataFile = path.join(this.uploadsDir, 'metadata.json');

  constructor() {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
    if (!fs.existsSync(this.metadataFile)) {
      fs.writeFileSync(this.metadataFile, JSON.stringify([]));
    }
  }

  private readMetadata(): any[] {
    try {
      const content = fs.readFileSync(this.metadataFile, 'utf-8');
      return JSON.parse(content || '[]');
    } catch (error) {
      this.logger.error(`Error reading metadata file: ${error.message}`);
      return [];
    }
  }

  private writeMetadata(metadata: any[]): void {
    try {
      fs.writeFileSync(this.metadataFile, JSON.stringify(metadata, null, 2));
    } catch (error) {
      this.logger.error(`Error writing metadata file: ${error.message}`);
    }
  }

  async doesExist(data: DoesExistRequest): Promise<DoesExistResponse> {
    const metadata = this.readMetadata();
    const exists = metadata.some((item) => item.hash === data.hash);
    return { exists };
  }

  uploadStream(requestStream: any, callback: (err: any, value: UploadResponse) => void) {
    const tempFileName = `temp-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const tempFilePath = path.join(this.uploadsDir, tempFileName);
    const writeStream = fs.createWriteStream(tempFilePath);
    const hash = crypto.createHash('sha256');

    let metadataInfo: { table: string; fileName: string; contentType: string } | null = null;
    let streamFailed = false;

    console.log("Backend: @GrpcStreamCall stream receiving...");

    requestStream.on('data', (request: any) => {
      if (streamFailed) return;
      console.log(`Backend: received chunk table=${request.table}, fileName=${request.fileName}, chunkLength=${request.chunk?.length}`);

      if (!metadataInfo && request.fileName) {
        metadataInfo = {
          table: request.table || 'default',
          fileName: request.fileName,
          contentType: request.contentType || 'application/octet-stream',
        };
      }

      if (request.chunk && request.chunk.length > 0) {
        writeStream.write(request.chunk);
        hash.update(request.chunk);
      }
    });

    requestStream.on('error', (err: any) => {
      console.error("Backend: Stream error occurred:", err);
      streamFailed = true;
      writeStream.end();
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      callback(null, {
        statusCode: 500,
        s3Url: '',
        error: err.message || 'Stream error',
      });
    });

    requestStream.on('end', () => {
      console.log("Backend: requestStream ended");
      if (streamFailed) return;
      writeStream.end();
    });

    writeStream.on('finish', () => {
      if (streamFailed) return;
      try {
        const fileHash = hash.digest('hex');

        const metadata = this.readMetadata();
        const existing = metadata.find((item) => item.hash === fileHash);

        if (existing) {
          fs.unlinkSync(tempFilePath);
          callback(null, {
            statusCode: 409,
            s3Url: existing.filePath,
            error: 'File already exists',
          });
          return;
        }

        const finalFileName = `${Date.now()}-${metadataInfo?.fileName || 'unnamed'}`;
        const finalFilePath = path.join(this.uploadsDir, finalFileName);
        fs.renameSync(tempFilePath, finalFilePath);

        const newRecord = {
          id: crypto.randomUUID ? crypto.randomUUID() : fileHash,
          fileName: metadataInfo?.fileName || 'unnamed',
          contentType: metadataInfo?.contentType || 'application/octet-stream',
          hash: fileHash,
          filePath: finalFilePath,
          table: metadataInfo?.table || 'default',
          createdAt: new Date().toISOString(),
        };
        metadata.push(newRecord);
        this.writeMetadata(metadata);

        callback(null, {
          statusCode: 200,
          s3Url: finalFilePath,
          error: '',
        });
      } catch (err) {
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
        callback(null, {
          statusCode: 500,
          s3Url: '',
          error: err.message,
        });
      }
    });
  }
}
