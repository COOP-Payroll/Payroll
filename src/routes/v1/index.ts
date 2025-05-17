import express from 'express';
import healthRoute from './health.route'
import config from '../../config/config';


const router = express.Router();


const devRoutes = [
  // routes available only in development mode
  {
    path: '/dev',
    route: healthRoute
  }
];

console.log('----', config.env)
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

export default router;