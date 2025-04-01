const auth = require("./../routes/auth.js");
const listing = require("./../routes/listing.js");
const handleMulterErrors = require("./../middlewares/handleMulterErrors.js");
const validateJWT = require('./../middlewares/validateJWT.js');
const { UserType } = require("../constants/static.js");
const env = require('./env.js');

function createApp() {
    const express = require('express');
    const app = express();
    const morgan = require('morgan');
    const cors = require('cors');
    const logger = require('./logger');
    const stream = {
        write: (message) => logger.http(message.trim()),
    };
    const session = require('express-session');
    // const passport = require('passport');
    const GoogleStrategy = require('passport-google-oauth20').Strategy;
    const passport = require('./passport.js');
    require('dotenv').config();

    app.use(express.urlencoded({ extended: true }));
    app.use(cors());
    app.use(express.json());
    app.use(morgan("combined", { stream }));
    app.use(express.json());
    app.use(session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
    }));
    app.use(passport.initialize());
    app.use(passport.session());

    // passport.use(new GoogleStrategy({
    //     clientID: process.env.GOOGLE_CLIENT_ID,
    //     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    //     callbackURL: 'http://localhost:3000/api/auth/google/callback',
    // }, (accessToken, refreshToken, profile, done) => {
    //     // console.log('Profile:', profile);
    //     return done(null, profile);
    // }));
    // // Serialize and deserialize user for session management
    // passport.serializeUser( (user, done) => {
    //     done(null, user);
    // });
    // passport.deserializeUser((user, done) => {
    //     done(null, user);
    // });

    // Routes
    app.get('/', (req, res) => {
        res.send(req.user ? `Welcome, ${req.user.displayName}! <a href="/logout">Logout</a>` : '<a href="/auth/google">Login with Google</a>');
    });

    // Google Auth Routes
    // app.get('/api/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
    // app.get('/api/auth/google/callback',
    //     passport.authenticate('google'),
    //     (req, res) =>{ 
    //         console.log('Callback Success, User:', req.user);
    //         res.redirect('/')
    //     },
    //     (err, req, res, next) => {
    //         console.error('OAuth Error:', err.oauthError || err);
    //         res.status(500).send('Authentication failed');
    //     }
    // );

    // app.get('/auth/google/callbacks',
    //     passport.authenticate('google', { failureRedirect: '/' }),
    //     (req, res) => {
    //         console.log('Callback reached, user:', req.user);
    //         res.redirect('/');
    //     },
    //     (err, req, res, next) => {
    //         console.error('Authentication error:', err);
    //         res.status(500).send('Authentication failed');
    //     }
    // );

    app.use("/api/v1/auth", auth);
    app.use("/api/v1/listing", validateJWT([UserType.User], env('tokenSecret')) ,listing);

    app.post("/test2", async (req, res) => {
        res.status(200).json({
            'error': false,
            'message': "result"
        });
    });

    app.use(handleMulterErrors);
    app.use((req, res, next) => {
        console.warn(`Unmatched route: ${req.method} ${req.path}`);
        res.status(404).json({
            error: true,
            message: "Route not found. Please check the URL or refer to the API documentation.",
        })
    });
    return app;
}


module.exports = createApp;