import passport from 'passport';
import localStrategy from 'passport-local';
import jwtStrategy from 'passport-jwt';

import UserModel from '../models/UserModel';

// handle user registration
passport.use(
  'signup',
  new localStrategy.Strategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      try {
        const { username } = req.body;
        const user = await UserModel.create({ email, password, username });
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// handle user login
passport.use(
  'login',
  new localStrategy.Strategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        const user = await UserModel.findOne({ email });
        if (!user) {
          return done(new Error('user not found'), false);
        }
        const valid = await user.isValidPassword(password);
        if (!valid) {
          return done(new Error('invalid password'), false);
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// verify jwt token
passport.use(
  new jwtStrategy.Strategy(
    {
      secretOrKey: process.env.JWT_SECRET,
      jwtFromRequest: (req) => {
        let token = null;
        if (req && req.cookies) token = req.cookies.jwt;
        return token;
      },
    },
    async (token, done) => {
      try {
        return done(null, token.user);
      } catch (error) {
        return done(error);
      }
    }
  )
);
