const express = require('express');

const { mustLoggedIn } = require('./middlewares');
const { User } = require('../models');

const router = express.Router();

router.post('/:id/follow', mustLoggedIn, async (req, res, next) => {
  try {
    const user = await User.find({
      where: {
        id: req.user.id,
      },
    });
    await user.addFollowing(parseInt(req.params.id, 10));
    res.send('success');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
