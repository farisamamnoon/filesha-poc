import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { join } from "path";
import { UploadService } from "./upload.service";
import { UploadController } from "./upload.controller";

@Module({
  imports: [
    ClientsModule.register([
      {
        name: "DIGITAL_PACKAGE",
        transport: Transport.GRPC,
        options: {
          package: "digital",
          protoPath: join(__dirname, "../digital.proto"),
          url: process.env.DIGITAL_LOG_SERVICE_URL || "localhost:5001",
        },
      },
    ]),
  ],
  providers: [UploadService],
  controllers: [UploadController],
})
export class UploadModule { }
