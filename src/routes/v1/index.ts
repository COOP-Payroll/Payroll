import express from "express";
import healthRoute from "./health.route";
import config from "../../config/config";
import companyRoute from "./company.route";
import departmentRoute from "./department.route";
import positionRoute from "./position.route";
import authRoute from "./auth.routes";
import userRoute from "./user.route";
import adminRoute from "./admin.route";
import participantRoute from "./participant.route";

const router = express.Router();

const defaultRoutes = [
  {
    path: "/users",
    route: userRoute,
  },
  {
    path: "/auth",
    route: authRoute,
  },
  {
    path: "/company",
    route: companyRoute,
  },

  {
    path: "/departments",
    route: departmentRoute,
  },

  {
    path: "/positions",
    route: positionRoute,
  },
  {
    path: "/admin",
    route: adminRoute,
  },
  {
    path: "/participants",
    route: participantRoute,
  },
];

const devRoutes = [
  // routes available only in development mode
  {
    path: "/dev",
    route: healthRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

if (config.env === "development") {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

export default router;
