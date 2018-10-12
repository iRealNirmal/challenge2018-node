const express = require('express');
const chalk = require('chalk');
const debug = require('debug')('app');
const morgan = require('morgan');
const path = require('path');
const bodyParser = require('body-parser');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;
const MongoStore = require('connect-mongo')(session);

//app.use(express.urlencoded({ extended: false }));

//enables cors
// app.use(cors({
//   allowedHeaders: ['sessionId', 'Content-Type'],
//   exposedHeaders: ['sessionId'],
//   origin: 'http://localhost:4200/',
//   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//   preflightContinue: false,
//   'Access-Control-Allow-Credentials': true,
//   'Access-Control-Allow-Origin': 'http://localhost:4200/'
// }));

app.all('/*', (req, res, next) => {
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header(
    'Access-Control-Allow-Headers',
    'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept'
  );
  next();
});

app.use(morgan('tiny'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(session({
//   secret: 'loyality',
//   saveUninitialized: true,
//   resave: true,
//   store: new MongoStore({ url: 'mongodb://localhost:27017/loyalityApp' })
// }));
app.use(session({
  secret: 'loyality',
  saveUninitialized: true,
  resave: true,
  store: new MongoStore({ url: 'mongodb://localhost:27017/loyalityApp' }),
  cookie: {
    expires: false,
  }
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());
require('./src/config/passport.js')(app);

app.use(express.static(path.join(__dirname, '/public/')));
app.use('/css', express.static(path.join(__dirname, '/node_modules/bootstrap/dist/css')));
app.use('/js', express.static(path.join(__dirname, '/node_modules/bootstrap/dist/js')));
app.use('/js', express.static(path.join(__dirname, '/node_modules/popper.js/dist/umd')));
app.use('/js', express.static(path.join(__dirname, '/node_modules/jquery-slim/dist')));
app.set('views', './src/view');
app.set('view engine', 'ejs');

const nav = [
  { link: '/books', title: 'Books' },
  { link: '/authors', title: 'Authors' }
];

const authRouter = require('./src/routes/authRoutes')(nav);
const applicationRouter = require('./src/routes/applicationRoutes.js')(nav);
const adminRouter = require('./src/routes/adminRoutes')(nav);


app.use('/auth', authRouter);
app.use('/application', applicationRouter);
app.use('/admin', adminRouter);


app.get('/', (req, res) => {
  // res.sendFile(path.join(__dirname, 'views/index.html'));
  res.render(
    'index',
    {
      nav: [
        { link: '/application', title: 'application' },
        { link: '/authors', title: 'Authors' }
      ],
      title: 'Loyality'
    }
  );
});

app.listen(3000, () => {
  debug(`Running on port ${chalk.green(port)}`);
}, '0.0.0.0');
