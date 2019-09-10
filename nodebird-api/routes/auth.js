const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const { mustLoggedIn, mustNotLoggedIn } = require('./middlewares');
const { User } = require('../models');

const router = express.Router();

router.post('/join', mustNotLoggedIn, async (req, res, next) => {
  const { email, nick, password } = req.body;
  try {
    const exUser = await User.findOne({ where: { email } });
    if (exUser) {
      req.flash('joinError', '이미 가입된 이메일입니다.');
      return res.redirect('/join');
    }
    const hash = await bcrypt.hash(password, 12);
    await User.create({
      email,
      nick,
      password: hash,
    });
    return res.redirect('/');
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

router.post('/login', mustNotLoggedIn, (req, res, next) => {
  passport.authenticate('local', (authError, user, info) => {
    // 에러처리
    if (authError) {
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      req.flash('loginError', info.message);
      return res.redirect('/');
    }
    // /에러처리

    return req.login(user, (loginError) => {
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
      return res.redirect('/');
    });
  })(req, res, next); // 미들웨어 내의 미들웨어에는 (req, res, next)를 붙인다.
});

router.get('/logout', mustLoggedIn, (req, res) => {
  req.logout();
  req.session.destroy();
  res.redirect('/');
});

router.get('/kakao', passport.authenticate('kakao'));

router.get(
  '/kakao/callback',
  passport.authenticate('kakao', {
    failureRedirect: '/',
  }),
  (req, res) => {
    res.redirect('/');
  },
);

router.post('/change', mustLoggedIn, async (req, res, next) => {
  console.log('pbw', req.body);
  const { email, nick, password } = req.body;
  console.log('req.user? ', req.user.id);

  if (!email || !nick || !password) {
    // 에러
    req.flash('changeError', '양식을 채워주세요');
    return res.redirect('/profile');
  }

  try {
    const hash = await bcrypt.hash(password, 12);
    const result = await User.update(
      {
        email,
        nick,
        password: hash,
      },
      {
        where: {
          id: req.user.id,
        },
      },
    );
    console.log('update result? ', result);
    res.redirect('/');
  } catch (e) {
    console.error(e);
    next(e);
  }
});

module.exports = router;
