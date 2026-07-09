import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as dotenv from "dotenv";
import * as path from "path";

// Explicitly load .env file before instantiating configuration
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

export class AppConfig {
  public readonly HTTP_PORT: number;
  public readonly APP_PORT: number;

  constructor() {
    const configService = new ConfigService();

    this.HTTP_PORT = parseInt(configService.get<string>("HTTP_PORT", "8080"), 10);
    if (isNaN(this.HTTP_PORT)) {
      throw new Error("Configuration error: HTTP_PORT must be a valid number.");
    }
    this.APP_PORT = parseInt(configService.get<string>("APP_PORT", "5001"), 10);
    if (isNaN(this.APP_PORT)) {
      throw new Error("Configuration error: APP_PORT must be a valid number.");
    }
  }

  public logConfig(logger: Logger) {
    logger.log("--- Startup Environment Configuration ---");
    logger.log(`HTTP_PORT: ${this.HTTP_PORT}`);
    logger.log(`APP_PORT: ${this.APP_PORT}`);
    logger.log("-----------------------------------------");
  }
}

export const appConfig = new AppConfig();
