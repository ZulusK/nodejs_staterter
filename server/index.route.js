const express = require('express');
const cp = require('child_process');
const authRoutes = require('@/auth/auth.route');
const usersRoutes = require('@/user/user.route');
// const stopsRoute = require('@/stop/stop.route');
// const routesRoute = require('@/route/route.route');
// const busesRoute = require('@/bus/bus.route');
// const eventsRoute = require('@/event/event.route');
const docsRouter = require('@root/docs.gen');
const config = require('@config/config');

const router = express.Router(); // eslint-disable-line new-cap

/** GET /health-check - Check service health */
router.get('/health-check', (req, res) => {
  const revision = cp
    .execSync('git rev-parse HEAD')
    .toString()
    .trim();

  res.send(`OK: ${revision}`);
});

module.exports = router;
router.use('/users', usersRoutes);
router.use('/auth', authRoutes);
// router.use('/stops', stopsRoute);
// router.use('/routes', routesRoute);
// router.use('/buses', busesRoute);
// router.use('/events', eventsRoute);
if (config.env === 'development') {
  router.use('/docs', docsRouter);
}
module.exports = router;
