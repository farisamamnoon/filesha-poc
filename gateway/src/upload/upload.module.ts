import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { join } from "path";
import { UploadService } from "./upload.service";
import { UploadController } from "./upload.controller";
import { appConfig } from "../config";

@Module({
  imports: [
    ClientsModule.register([
      {
        name: "DIGITAL_PACKAGE",
        transport: Transport.GRPC,
        options: {
          package: "digital",
          protoPath: join(__dirname, "../digital.proto"),
          url: appConfig.DIGITAL_LOG_SERVICE_URL,
        },
      },
    ]),
  ],
  providers: [UploadService],
  controllers: [UploadController],
})
export class UploadModule { }
