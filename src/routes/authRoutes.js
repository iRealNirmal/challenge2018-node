const express = require('express');
const { MongoClient } = require('mongodb');
const debug = require('debug')('app:adminRoutes');
const passport = require('passport');

const app = express();
const authRouter = express.Router();

module.exports = function router(nav) {
  app.use(passport.session());
  const url = 'mongodb://localhost:27017';
  const dbName = 'loyalityApp';

  authRouter.route('/signup')
    .post((req, res) => {
      const {
        username, password, email, firstname, lastname
      } = req.body;


      async function checkLoyalitNumber() {
        let client;
        try {
          client = await MongoClient.connect(url, { useNewUrlParser: true });

          const db = client.db(dbName);

          const col = db.collection('user');

          const randomNumber = Math.random().toString().slice(2, 14);


          const numberExists = await col.findOne({ loyalitNumber: randomNumber });
          return (numberExists) ? false : randomNumber;
        } catch (err) {
          debug(err);
        }
      }

      (async function addUser() {
        let client;
        try {
          client = await MongoClient.connect(url, { useNewUrlParser: true });

          const db = client.db(dbName);

          const col = db.collection('user');

          //  let randomNumber = checkLoyalitNumber();

          const randomNumber = Math.random().toString().slice(2, 14);

          //   const random = { loyalitNumber: randomNumber };

          // const numberExists = await col.findOne({ loyalitNumber: randomNumber });
          // if (numberExists) {
          // }
          let idCount;
          await col.countDocuments().then((count) => {
            idCount = count + 1;
          });
          const user = { id: idCount, username, password, email, firstname, lastname, loyalitNumber: randomNumber, points: 0 };
          const result = await col.insertOne(user);
          //   debug(result);
          req.login(result.ops[0], () => {
            res.status(200).json({ status: 'ok' });
          });
        } catch (err) {
          debug(err);
        }
      }());


      debug(req.body);
      // create user
    });



  authRouter.post('/signin', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) { return next(err); }
      if (!user) { return res.status(401).json('unauthorized'); }
      req.logIn(user, (errs) => {
        if (err) { return next(errs); }
        req.session.username = user.username;
        return res.status(200).json({ status: 'ok', session: req.sessionID });
      });
    })(req, res, next);
  });

  authRouter.route('/isSession')
    .post((req, res) => {
      passport.authenticate('local')(req, res, () => {
        res.status(200).json({ status: 'ok' });
      });
    });

  return authRouter;
};
