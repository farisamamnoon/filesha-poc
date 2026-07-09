import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as dotenv from "dotenv";
import * as path from "path";

// Explicitly load .env file before instantiating configuration
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

export class AppConfig {
  public readonly APP_PORT: number;
  public readonly REQUEST_BODY_LIMIT: string;
  public readonly DIGITAL_LOG_SERVICE_URL: string;
  public readonly ALLOWED_MIMETYPES: string[];

  constructor() {
    const configService = new ConfigService();

    this.APP_PORT = parseInt(configService.get<string>("APP_PORT", "3000"), 10);
    if (isNaN(this.APP_PORT)) {
      throw new Error("Configuration error: APP_PORT must be a valid number.");
    }
    this.REQUEST_BODY_LIMIT = configService.get<string>("REQUEST_BODY_LIMIT", "100mb");
    this.DIGITAL_LOG_SERVICE_URL = configService.get<string>("DIGITAL_LOG_SERVICE_URL", "localhost:5001");

    let rawMimetypes = configService.get<string>("ALLOWED_MIMETYPES");
    if (!rawMimetypes) {
      if (configService.get<string>("NODE_ENV") === "test") {
        rawMimetypes = "image/jpeg,image/png,application/pdf";
      } else {
        throw new Error("Configuration error: ALLOWED_MIMETYPES environment variable is required.");
      }
    }

    this.ALLOWED_MIMETYPES = rawMimetypes
      .split(",")
      .map((type) => type.trim())
      .filter((type) => type.length > 0);

    if (this.ALLOWED_MIMETYPES.length === 0) {
      throw new Error("Configuration error: ALLOWED_MIMETYPES environment variable cannot be empty.");
    }
  }

  public logConfig(logger: Logger) {
    logger.log("--- Startup Environment Configuration ---");
    logger.log(`APP_PORT: ${this.APP_PORT}`);
    logger.log(`REQUEST_BODY_LIMIT: ${this.REQUEST_BODY_LIMIT}`);
    logger.log(`DIGITAL_LOG_SERVICE_URL: ${this.DIGITAL_LOG_SERVICE_URL}`);
    logger.log(`ALLOWED_MIMETYPES: ${JSON.stringify(this.ALLOWED_MIMETYPES)}`);
    logger.log("-----------------------------------------");
  }
}

export const appConfig = new AppConfig();
