const express = require('express');
const authService = require('../services/auth.service');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

router.post('/login', async (req, res) => {
  res.json(await authService.login(req.body));
});

router.get('/me', requireAuth, (req, res) => {
  res.json(req.user);
});

router.post('/logout', requireAuth, async (req, res) => {
  await authService.logout(req.authToken);
  res.status(204).end();
});

module.exports = router;
