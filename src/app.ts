import path from "path";
import express from "express";
import passport from "passport";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import routes from "./routes/v1";
import { jwtStrategy } from "./config/passport";
import ApiError from "./utils/api-error";
import httpStatus from "http-status";
import { errorConverter, errorHandler } from "./middlewares/error";
import config from "./config/config";
import morgan from "./config/morgan";

const app = express();

if (config.env !== "test") {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// gzip compression
app.use(compression());

// Enable CORS for all routes
app.use(cors());

// Enable pre-flight for all OPTIONS requests
app.options("*name", cors());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// jwt authentication
app.use(passport.initialize());
passport.use("jwt", jwtStrategy);

// v1 api routes
app.use("/api/v1", routes);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, "Not found"));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

export default app;
