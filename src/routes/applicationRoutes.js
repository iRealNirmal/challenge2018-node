const express = require('express');
const { MongoClient, ObjectID } = require('mongodb');
const debug = require('debug')('app:adminRoutes');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const ObjectId = require('mongodb').ObjectID;

const app = express();
const applicationRouter = express.Router();
const url = 'mongodb://localhost:27017';
const dbName = 'loyalityApp';

function router(nav) {
  app.use(passport.session());

  applicationRouter.route('/').get((req, res) => {
    (async function mongo() {
      let client;
      try {
        client = await MongoClient.connect(url, { useNewUrlParser: true });
        debug('connected correctly to server');
        const db = client.db(dbname);
        const col = await db.collection('books');
        const books = await col.find().toArray();
        res.render('bookListView',
          {
            nav,
            title: 'Library',
            books
          });
      } catch (err) {
        debug(err.stack);
      }
      client.close();
    }());
  });
  applicationRouter.use((req, res, next) => {
    console.log(req.isAuthenticated());
    if (req.user || req.method === 'OPTIONS') {
      next();
    } else {
      return res.status(401).json({
        error: 'unauthorized'
      });
    }
  });
  applicationRouter.route('/:id').get((req, res) => {
    (async function mongo() {
      let client;
      try {
        client = await MongoClient.connect(url, { useNewUrlParser: true });
        const { id } = req.params;
        const db = client.db(dbname);
        const col = await db.collection('books');

        const book = await col.findOne({ _id: ObjectID(id) });

        res.render('bookView',
          {
            nav,
            title: 'Library',
            book
          });
      } catch (err) {
        debug(err.stack);
      }
      client.close();
    }());
  });


  applicationRouter.route('/profile')
    .post((req, res, next) => {

      console.log(req.user);
      res.status(200).json(req.user);
    });

  applicationRouter.route('/shopnear')
    .post(async (req, res) => {
    //  (async function fetchLocation() {

      try {
        const client = await MongoClient.connect(url, { useNewUrlParser: true });

        const db = client.db(dbName);

        const col = db.collection('restaurant');

        const {
          lat, lng
        } = req.body;

        const answer = await col.find({ 'location' : { $near: { $geometry: { type: 'Point', coordinates: [ lat, lng ] }, $maxDistance: 50000 } } }).limit(20).toArray((err, result) => {
          if (err) throw err;
          console.log(result);
          res.status(200).json(result);
        });
      } catch (err) {
        debug(err);
      }
      // }());
    });

  applicationRouter.route('/shop')
    .post(async (req, res) => {
    //  (async function fetchLocation() {
      try {
        const client = await MongoClient.connect(url, { useNewUrlParser: true });

        const db = client.db(dbName);

        await db.collection('restaurant').find({}).toArray((error, documents) => {
          if (error) throw error;

          return res.status(200).send(documents);
        });
      } catch (err) {
        debug(err);
      }
    });

  applicationRouter.route('/shoplist')
    .post(async (req, res) => {
    //  (async function fetchLocation() {
      try {
        const client = await MongoClient.connect(url, { useNewUrlParser: true });

        const db = client.db(dbName);

        await db.collection('items').find({}).toArray((error, documents) => {
          if (error) throw error;

          return res.status(200).send(documents);
        });
      } catch (err) {
        debug(err);
      }
    });

  applicationRouter.route('/buy')
    .post(async (req, res, next) => {

      try {
        const client = await MongoClient.connect(url, { useNewUrlParser: true });

        const db = client.db(dbName);


        const col = db.collection('orders');

        const userId = req.user.id;

        const {
          item, rewards, total, date
        } = req.body;
        const order = { customerId: userId, products: item, amount: total, orderDate: date };

        const result = await col.insertOne(order);

        const col2 = db.collection('user');
        const userData = await col2.findOne({ id: userId });
        let { points } = userData;
        points += rewards;

        col2.updateOne(
          { id: userId },
          { $set: { 'points': points } }
        );

        return res.status(200).json({ status: 'ok' });
      } catch (err) {
        debug(err);
      }
    });

  applicationRouter.route('/purchaseHistory')
    .post(async (req, res) => {
      try {
        const client = await MongoClient.connect(url, { useNewUrlParser: true });

        const db = client.db(dbName);

        await db.collection('orders').find({ customerId: req.user.id }).toArray((error, documents) => {
          if (error) throw error;
          return res.status(200).send(documents);
        });
      } catch (err) {
        debug(err);
      }
    });

  applicationRouter.route('/viewOrder')
    .post(async (req, res) => {
      try {
        const client = await MongoClient.connect(url, { useNewUrlParser: true });

        const db = client.db(dbName);

        const {
          id
        } = req.body;

        const order = await db.collection('orders').findOne({ _id: ObjectId(id) });
        return res.status(200).send(order);
      } catch (err) {
        debug(err);
      }
    });

  return applicationRouter;
}


module.exports = router;
