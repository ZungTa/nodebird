const express = require('express');
const router = express.Router();

router.get('/profile', (req, res) => {
  res.render('profile', {
    title: '내 정보 - NodeBird',
    user: null,
  });
});

router.get('/join', (req, res) => {});
