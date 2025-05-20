import express from "express";
import routes from "./routes/v1";
import ApiError from "./utils/api-error";
import httpStatus from "http-status";
import { errorConverter, errorHandler } from "./middlewares/error";
import path from 'path';
import uploadRoutes from './routes/v1/upload.route';
const app = express();

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
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
