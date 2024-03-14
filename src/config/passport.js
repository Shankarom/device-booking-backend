const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const config = require('./config');
const { tokenTypes } = require('./tokens');
const { User, Company } = require('../models');

const jwtOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const jwtVerify = async (payload, done) => {
  try {
    if (payload.type !== tokenTypes.REFRESH) {
      throw new Error('Invalid token type');
    }
    let user;
    if(payload.userType === 'company') {
      user = await Company.findById(payload.sub);
    if (!user) {
      return done(null, false);
    }
    } else {
      user = await User.findById(payload.sub);
    if (!user) {
      return done(null, false);
    }
    }
    
    done(null, user);
  } catch (error) {
    done(error.message, false);
  }
};

const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);

module.exports = {
  jwtStrategy,
};
