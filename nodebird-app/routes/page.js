const express = require('express');
const axios = require('axios');
const { mustLoggedIn, mustNotLoggedIn } = require('./middlewares');
const { Post, User } = require('../models');

const router = express.Router();

router.get('/profile', mustLoggedIn, (req, res) => {
  res.render('profile', {
    title: '내 정보 - NodeBird',
    user: req.user,
    changeError: req.flash('changeError'),
  });
});

router.get('/join', mustNotLoggedIn, (req, res) => {
  res.render('join', {
    title: '회원가입 - NodeBird',
    user: req.user,
    joinError: req.flash('joinError'),
  });
});

router.get('/', (req, res, next) => {
  Post.findAll({
    include: {
      model: User,
      attributes: ['id', 'nick'],
    },
    order: [['createdAt', 'DESC']],
  })
    .then(async (posts) => {
      for (post of posts) {
        const like = await post.getLike();
        if (!like || like.length <= 0) {
          console.log('like return');
          continue;
        }
        post.likeUserIds = like.map((u) => u.id);
      }
      for (post of posts) {
        console.log(
          'post.likeUserIds',
          post.id,
          post.content,
          post.likeUserIds,
        );
      }
      res.render('main', {
        title: 'NodeBird',
        twits: posts,
        user: req.user,
        axios,
        loginError: req.flash('loginError'),
      });
    })
    .catch((err) => {
      console.error(err);
      next(err);
    });
});

module.exports = router;
