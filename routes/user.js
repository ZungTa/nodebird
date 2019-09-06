const express = require('express');

const { mustLoggedIn } = require('./middlewares');
const {
  User,
  sequelize: {
    models: { Follow },
  },
} = require('../models');

const router = express.Router();

router.post('/:id/follow', mustLoggedIn, async (req, res, next) => {
  try {
    // const user = await User.findOne({
    //   where: {
    //     id: req.user.id,
    //   },
    // });
    // await user.addFollowing(parseInt(req.params.id, 10));

    /**
     * @note 책에 있는 내용을 반대로 바꿔봤다 방식을. 위에가 책 내용
     */
    const user = await User.findOne({
      where: {
        id: req.params.id,
      },
    });
    await user.addFollower(parseInt(req.user.id, 10));

    res.send('success');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post('/:id/unFollow', mustLoggedIn, async (req, res, next) => {
  const follow = await Follow.findOne({
    where: {
      followerId: req.user.id,
      followingId: req.params.id,
    },
  });

  await follow.destroy();

  res.send('success');
});

module.exports = router;
