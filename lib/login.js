(function() {
  var Command, Login, Q, _, auth, open, read, yargs,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  _ = require('underscore-plus');

  yargs = require('yargs');

  Q = require('q');

  read = require('read');

  open = require('open');

  auth = require('./auth');

  Command = require('./command');

  module.exports = Login = (function(superClass) {
    extend(Login, superClass);

    function Login() {
      this.saveToken = bind(this.saveToken, this);
      this.getToken = bind(this.getToken, this);
      this.welcomeMessage = bind(this.welcomeMessage, this);
      return Login.__super__.constructor.apply(this, arguments);
    }

    Login.getTokenOrLogin = function(callback) {
      return auth.getToken(function(error, token) {
        if (error != null) {
          return new Login().run({
            callback: callback,
            commandArgs: []
          });
        } else {
          return callback(null, token);
        }
      });
    };

    Login.commandNames = ['login'];

    Login.prototype.parseOptions = function(argv) {
      var options;
      options = yargs(argv).wrap(100);
      options.usage("Usage: ipm login\n\nEnter your Inkdrop API token and save it to the keychain. This token will\nbe used to identify you when publishing packages to Inkdrop.");
      options.alias('h', 'help').describe('help', 'Print this usage message');
      return options.string('token').describe('token', 'Inkdrop API token');
    };

    Login.prototype.run = function(options) {
      var callback;
      callback = options.callback;
      options = this.parseOptions(options.commandArgs);
      return Q({
        token: options.argv.token
      }).then(this.welcomeMessage).then(this.openURL).then(this.getToken).then(this.saveToken).then(function(token) {
        return callback(null, token);
      })["catch"](callback);
    };

    Login.prototype.prompt = function(options) {
      var readPromise;
      readPromise = Q.denodeify(read);
      return readPromise(options);
    };

    Login.prototype.welcomeMessage = function(state) {
      var welcome;
      if (state.token) {
        return Q(state);
      }
      welcome = "Welcome to Inkdrop!\n\nBefore you can publish packages, you'll need an API token.\n\nVisit your account page on Inkdrop " + 'https://app.inkdrop.info/'.underline + ",\ncopy the token and paste it below when prompted.\n";
      console.log(welcome);
      return this.prompt({
        prompt: "Press [Enter] to open your account page on Inkdrop."
      });
    };

    Login.prototype.openURL = function(state) {
      if (state.token) {
        return Q(state);
      }
      return open('https://app.inkdrop.info/api-keys');
    };

    Login.prototype.getToken = function(state) {
      if (state.token) {
        return Q(state);
      }
      return this.prompt({
        prompt: 'Access Key ID>',
        edit: true
      }).spread((function(_this) {
        return function(keyId) {
          state.keyId = keyId;
          return _this.prompt({
            prompt: 'Secret Access Key>',
            edit: true
          });
        };
      })(this)).spread(function(secret) {
        state.secret = secret;
        state.token = 'Basic ' + new Buffer(state.keyId + ":" + state.secret).toString('base64');
        return Q(state);
      });
    };

    Login.prototype.saveToken = function(arg) {
      var token;
      token = arg.token;
      if (!token) {
        throw new Error("Token is required");
      }
      process.stdout.write('Saving token to Keychain ');
      auth.saveToken(token);
      this.logSuccess();
      return Q(token);
    };

    return Login;

  })(Command);

}).call(this);
