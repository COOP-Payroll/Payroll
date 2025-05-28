"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const health_route_1 = __importDefault(require("./health.route"));
const config_1 = __importDefault(require("../../config/config"));
const company_route_1 = __importDefault(require("./company.route"));
const department_route_1 = __importDefault(require("./department.route"));
const position_route_1 = __importDefault(require("./position.route"));
const auth_routes_1 = __importDefault(require("./auth.routes"));
const user_route_1 = __importDefault(require("./user.route"));
const admin_route_1 = __importDefault(require("./admin.route"));
const participant_route_1 = __importDefault(require("./participant.route"));
const campaign_route_1 = __importDefault(require("./campaign.route"));
const upload_route_1 = __importDefault(require("./upload.route"));
const rateSetting_route_1 = __importDefault(require("./rateSetting.route"));
const campaignparticipant_route_1 = __importDefault(require("./campaignparticipant.route"));
const approval_route_1 = __importDefault(require("./approval.route"));
const account_route_1 = __importDefault(require("./account.route"));
const router = express_1.default.Router();
const defaultRoutes = [
    {
        path: "/users",
        route: user_route_1.default,
    },
    {
        path: "/auth",
        route: auth_routes_1.default,
    },
    {
        path: "/company",
        route: company_route_1.default,
    },
    {
        path: "/departments",
        route: department_route_1.default,
    },
    {
        path: "/positions",
        route: position_route_1.default,
    },
    {
        path: "/admin",
        route: admin_route_1.default,
    },
    {
        path: "/participants",
        route: participant_route_1.default,
    },
    {
        path: "/campaign",
        route: campaign_route_1.default,
    },
    {
        path: "/uploads",
        route: upload_route_1.default,
    },
    {
        path: "/ratesetting",
        route: rateSetting_route_1.default,
    },
    {
        path: "/campaignparticipant",
        route: campaignparticipant_route_1.default,
    },
    {
        path: "/approve",
        route: approval_route_1.default,
    },
    {
        path: "/account",
        route: account_route_1.default,
    },
];
const devRoutes = [
    // routes available only in development mode
    {
        path: "/dev",
        route: health_route_1.default,
    },
];
defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});
if (config_1.default.env === "development") {
    devRoutes.forEach((route) => {
        router.use(route.path, route.route);
    });
}
exports.default = router;
