import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import {
  Logger,
  RequestMethod,
  ValidationPipe,
  VersioningType,
} from "@nestjs/common";
import * as cookieParser from "cookie-parser";
import { json, urlencoded } from "express";
import { appConfig } from "./config";

async function bootstrap() {
  const logger = new Logger(AppModule.name);

  // Log environment configuration used on startup
  appConfig.logConfig(logger);

  const PORT = appConfig.APP_PORT;
  const requestBodyLimit = appConfig.REQUEST_BODY_LIMIT;
  const app = await NestFactory.create(AppModule);

  const options = {
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:6013",
      "https://rbac.sp.bluecast.host",
      "https://sp.bluecast.host",
      "https://masters.sp.bluecast.host",
      "https://tasks.sp.bluecast.host",
      "https://attendance.sp.bluecast.host",
      "https://digitallog.sp.bluecast.host",
      "http://164.52.215.173:6010",
      "http://164.52.215.173:6011",
      "http://164.52.215.173:6012",
      "http://164.52.215.173:6013",
      "http://164.52.215.173:6014",
      "http://164.52.215.173:6020",
      "http://164.52.215.173:6021",
      "http://164.52.215.173:6022",
      "http://164.52.215.173:6023",
      "http://164.52.215.173:6024",
      "https://test.rbac.sp.bluecast.host",
      "https://test.sp.bluecast.host",
      "https://test.masters.sp.bluecast.host",
      "https://test.tasks.sp.bluecast.host",
      "https://test.attendance.sp.bluecast.host",
      "https://test.digitallog.sp.bluecast.host",
      'http://192.168.1.20:3001',
      'http://192.168.29.98:3001',
      'http://192.168.1.4:3001',
      'http://192.168.1.4:6013',
      'http://10.169.107.95',
    ],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
    headers: "Content-Type, Authorization , Accept , X-Requested-With ",
  };

  // Use cookie parser middleware
  app.use(cookieParser());

  // Increase request payload limits for JSON and URL-encoded requests.
  app.use(json({ limit: requestBodyLimit }));
  app.use(urlencoded({ extended: true, limit: requestBodyLimit }));

  // Enable validation
  app.useGlobalPipes(new ValidationPipe());

  // Enable CORS if needed
  app.enableCors(options);

  // Set global prefix for all routes
  app.setGlobalPrefix("api", {
    exclude: [{ path: "health", method: RequestMethod.GET }],
  });

  // Api Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: "1",
  });

  // Start the application
  await app.listen(PORT, "0.0.0.0");
  logger.log(`Gateway is running on port: ${PORT}`);
}
bootstrap();
