var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var bcrypt = require("bcrypt");

var UserSchema = new Schema({
  name: { type: String, required: true, maxLength: 25 },
  email: {
    type: String,
    required: true,
    maxLength: 25,
    index: { unique: true },
  },
  password: { type: String, required: true, maxLength: 50 },
  // Login attempts
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Number },
});

// Virtual first name property
UserSchema.virtual("first_name").get(function () {
  return this.name.split(" ")[0];
});

// Virtual check if account locked
UserSchema.virtual("isLocked").get(function () {
  return this.lockUntil && this.lockUntil > Date.now();
});

// Mongoose pre-save to hash password (does NOT fire on update)
UserSchema.pre("save", function (next) {
  var user = this;
  if (!user.isModified("password")) {
    return next();
  }

  // Generate salt
  bcrypt.genSalt(parseInt(process.env.SALT_WORK_FACTOR), function (err, salt) {
    if (err) {
      return next(err);
    }

    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) {
        return next(err);
      }

      user.password = hash;
      return next();
    });
  });
});

// Verify password
UserSchema.methods.comparePassword = function (candidatePassword, callback) {
  bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
    if (err) {
      return callback(err);
    }

    callback(null, isMatch);
  });
};

// Manage login attempts
UserSchema.methods.incLoginAttempts = function (callback) {
  // reset attempts to 1 if lock has expired
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne(
      {
        $set: { loginAttempts: 1 },
        $unset: { lockUntil: 1 },
      },
      callback
    );
  }
  // otherwise increment
  var updates = { $inc: { loginAttempts: 1 } };
  // Lock if incrementing hits max attempts
  if (
    this.loginAttempts + 1 >= parseInt(process.env.MAX_LOGIN_ATTEMPTS) &&
    !this.isLocked
  ) {
    updates.$set = {
      lockUntil: Date.now() + parseInt(process.env.LOCK_TIME),
    };
  }
};

// Failed authentication reasons
var reasons = (UserSchema.statics.failedLogin = {
  NOT_FOUND: 0,
  PASSWORD_INCORRECT: 1,
  MAX_ATTEMPS: 2,
});

// callback takes 3 arguments: err, user, reason
UserSchema.statics.getAuthenticated = function (email, password, callback) {
  this.findOne({ email: email }, function (err, found_user) {
    // pass serious error up
    if (err) {
      return callback(err);
    }

    // return reason for auth failure
    if (!found_user) {
      return callback(null, null, reasons.NOT_FOUND);
    }

    // we have a user!
    if (found_user.isLocked) {
      // inc login attempts
      return found_user.incLoginAttempts(function (err) {
        if (err) {
          return callback(err);
        }
        return callback(null, null, reasons.MAX_ATTEMPS);
      });
    }

    // we have a user and they're not locked out!
    found_user.comparePassword(password, function (err, isMatch) {
      if (err) {
        return callback(err);
      }

      // check if password matched
      if (isMatch) {
        if (!found_user.loginAttempts && !found_user.lockUntil) {
          return callback(null, found_user);
        }

        // reset loginattempts and lock
        var updates = {
          $set: { loginAttempts: 0 },
          $unset: { lockUntil: 1 },
        };

        return found_user.updateOne(updates, function (err) {
          if (err) {
            callback(err);
          }

          return callback(null, found_user);
        });
      }

      found_user.incLoginAttempts(function (err) {
        if (err) {
          return callback(err);
        }

        // password incorrect, sorry user!
        return callback(null, null, reasons.PASSWORD_INCORRECT);
      });
    });
  });
};

module.exports = mongoose.model("User", UserSchema);
