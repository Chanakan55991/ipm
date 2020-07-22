(function() {
  var Command, Login, Q, _, auth, open, read, yargs,
    boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

  _ = require('underscore-plus');

  yargs = require('yargs');

  Q = require('q');

  read = require('read');

  open = require('open');

  auth = require('./auth');

  Command = require('./command');

  module.exports = Login = (function() {
    class Login extends Command {
      constructor() {
        super(...arguments);
        this.welcomeMessage = this.welcomeMessage.bind(this);
        this.getToken = this.getToken.bind(this);
        this.saveToken = this.saveToken.bind(this);
      }

      static getTokenOrLogin(callback) {
        return auth.getToken(function(error, token) {
          if (error != null) {
            return new Login().run({
              callback,
              commandArgs: []
            });
          } else {
            return callback(null, token);
          }
        });
      }

      parseOptions(argv) {
        var options;
        options = yargs(argv).wrap(Math.min(100, yargs.terminalWidth()));
        options.usage(`Usage: ipm login

Enter your Inkdrop API token and save it to the keychain. This token will
be used to identify you when publishing packages to Inkdrop.`);
        options.alias('h', 'help').describe('help', 'Print this usage message');
        return options.string('token').describe('token', 'Inkdrop API token');
      }

      run(options) {
        var callback;
        ({callback} = options);
        options = this.parseOptions(options.commandArgs);
        return Q({
          token: options.argv.token
        }).then(this.welcomeMessage).then(this.openURL).then(this.getToken).then(this.saveToken).then(function(token) {
          return callback(null, token);
        }).catch(callback);
      }

      prompt(options) {
        var readPromise;
        readPromise = Q.denodeify(read);
        return readPromise(options);
      }

      welcomeMessage(state) {
        var welcome;
        boundMethodCheck(this, Login);
        if (state.token) {
          return Q(state);
        }
        welcome = `Welcome to Inkdrop!

Before you can publish packages, you'll need an API token.

Visit your account page on Inkdrop ${'https://my.inkdrop.app/'.underline},
copy the token and paste it below when prompted.
`;
        console.log(welcome);
        return this.prompt({
          prompt: "Press [Enter] to open your account page on Inkdrop."
        });
      }

      openURL(state) {
        if (state.token) {
          return Q(state);
        }
        return open('https://my.inkdrop.app/api-keys');
      }

      getToken(state) {
        boundMethodCheck(this, Login);
        if (state.token) {
          return Q(state);
        }
        return this.prompt({
          prompt: 'Access Key ID>',
          edit: true
        }).spread((keyId) => {
          state.keyId = keyId;
          return this.prompt({
            prompt: 'Secret Access Key>',
            edit: true
          });
        }).spread(function(secret) {
          state.secret = secret;
          state.token = 'Basic ' + new Buffer(`${state.keyId}:${state.secret}`).toString('base64');
          return Q(state);
        });
      }

      saveToken({token}) {
        boundMethodCheck(this, Login);
        if (!token) {
          throw new Error("Token is required");
        }
        process.stdout.write('Saving token to Keychain ');
        auth.saveToken(token);
        this.logSuccess();
        return Q(token);
      }

    };

    Login.commandNames = ['login'];

    return Login;

  }).call(this);

}).call(this);
