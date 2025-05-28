"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const v1_1 = __importDefault(require("./routes/v1"));
const passport_2 = require("./config/passport");
const api_error_1 = __importDefault(require("./utils/api-error"));
const http_status_1 = __importDefault(require("http-status"));
const error_1 = require("./middlewares/error");
const config_1 = __importDefault(require("./config/config"));
const morgan_1 = __importDefault(require("./config/morgan"));
const api_1 = require("@bull-board/api");
const bullMQAdapter_1 = require("@bull-board/api/bullMQAdapter");
const express_2 = require("@bull-board/express");
const queues_1 = require("./queues");
const serverAdapter = new express_2.ExpressAdapter();
serverAdapter.setBasePath("/ui");
(0, api_1.createBullBoard)({
    queues: [new bullMQAdapter_1.BullMQAdapter(queues_1.paymentQueue), new bullMQAdapter_1.BullMQAdapter(queues_1.smsQueue)],
    serverAdapter,
});
serverAdapter.setBasePath("/admin/queues");
const app = (0, express_1.default)();
if (config_1.default.env !== "test") {
    app.use(morgan_1.default.successHandler);
    app.use(morgan_1.default.errorHandler);
}
app.use("/admin/queues", serverAdapter.getRouter());
// set security HTTP headers
app.use((0, helmet_1.default)());
// parse json request body
app.use(express_1.default.json());
// parse urlencoded request body
app.use(express_1.default.urlencoded({ extended: true }));
// gzip compression
app.use((0, compression_1.default)());
// Enable CORS for all routes
app.use((0, cors_1.default)());
// Enable pre-flight for all OPTIONS requests
app.options("*name", (0, cors_1.default)());
// parse urlencoded request body
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../uploads")));
// jwt authentication
app.use(passport_1.default.initialize());
passport_1.default.use("jwt", passport_2.jwtStrategy);
// v1 api routes
app.use("/api/v1", v1_1.default);
// send back a 404 error for any unknown api request
app.use((req, res, next) => {
    next(new api_error_1.default(http_status_1.default.NOT_FOUND, "Not found"));
});
// convert error to ApiError, if needed
app.use(error_1.errorConverter);
// handle error
app.use(error_1.errorHandler);
exports.default = app;
