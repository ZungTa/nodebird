const express = require('express');
const { mustLoggedIn, mustNotLoggedIn } = require('./middlewares');
const { Post, User } = require('../models');

const router = express.Router();

router.get('/profile', mustLoggedIn, (req, res) => {
  res.render('profile', {
    title: '내 정보 - NodeBird',
    user: null,
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
  console.log('router get /');
  Post.findAll({
    include: {
      model: User,
      attributes: ['id', 'nick'],
    },
    order: [['createdAt', 'DESC']],
  })
    .then((posts) => {
      console.log('Post.findAll? ', posts);
      res.render('main', {
        title: 'NodeBird',
        twits: posts,
        user: req.user,
        loginError: req.flash('loginError'),
      });
    })
    .catch((err) => {
      console.error(err);
      next(err);
    });
});

module.exports = router;
