const express = require('express');
// const authRoutes = require('@server/auth/auth.route');
const cp = require('child_process');

const router = express.Router(); // eslint-disable-line new-cap

/** GET /health-check - Check service health */
router.get('/health-check', (req, res) => {
  const revision = cp
    .execSync('git rev-parse HEAD')
    .toString()
    .trim();

  res.send(`OK: ${revision}`);
});

// router.use('/auth', authRoutes);

module.exports = router;
