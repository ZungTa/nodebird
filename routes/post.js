const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { Post, Hashtag, User } = require('../models');
const { mustLoggedIn } = require('./middlewares');

const router = express.Router();
const uploadsFolderName = 'uploads';

fs.readdir(uploadsFolderName, (err) => {
  if (err) {
    console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
    fs.mkdirSync(uploadsFolderName);
  }
});

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, callback) {
      callback(null, uploadsFolderName + '/');
    },
    filename(req, file, callback) {
      const ext = path.extname(file.originalname);
      console.log('ext? ', ext);
      const fileName =
        path.basename(file.originalname, ext) + Date.now().valueOf() + ext;
      console.log('fileName? ', fileName);
      callback(null, fileName);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post('/img', mustLoggedIn, upload.single('img'), (req, res) => {
  console.log('post /img', req.file);
  res.json({ url: `/img/${req.file.filename}` });
});

const upload2 = multer();
router.post('/', mustLoggedIn, upload2.none(), async (req, res, next) => {
  console.log('post /post ', req.body);
  try {
    const post = await Post.create({
      content: req.body.content,
      img: req.body.url,
      userId: req.user.id,
    });
    const hashtags = req.body.content.match(/#[^\s]*/g);
    console.log('hashtags ', hashtags);
    if (hashtags) {
      const result = await Promise.all(
        hashtags.map((tag) =>
          Hashtag.findOrCreate({
            where: {
              title: tag.slice(1).toLowerCase(),
            },
          }),
        ),
      );
      console.log('post / hashtags', result);
      await post.addHashtags(result.map((r) => r[0]));
    }
    res.redirect('/');
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get('/hashtag', async (req, res, next) => {
  const query = req.query.hashtag;
  if (!query) {
    return res.redirect('/');
  }

  try {
    const hashtag = await Hashtag.findOne({ where: { title: query } });
    let posts = [];
    if (hashtag) {
      posts = await hashtag.getPosts({ include: [{ model: User }] });
    }
    return res.render('main', {
      title: `${query} | NodeBird`,
      user: req.uset,
      twits: posts,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
