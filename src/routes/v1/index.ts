import express from 'express';
import healthRoute from './health.route'
import config from '../../config/config';
import companyRoute from './company.route';
import userRoute from './user.route'
import authRoute from './auth.routes'


const router = express.Router();


const defaultRoutes = [
   {
    path: '/auth',
    route: authRoute
  },
  {
    path: '/company',
    route: companyRoute
  },
  {
    path: '/users',
    route: userRoute
  }
];


const devRoutes = [
  // routes available only in development mode
  {
    path: '/dev',
    route: healthRoute
  }
];


defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

export default router;