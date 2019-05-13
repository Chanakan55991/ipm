(function() {
  var KEY_ACCESS_ID, error, getAccessKeyId, getSecretAccessKey, keytar, tokenName;

  try {
    keytar = require('keytar');
  } catch (error1) {
    error = error1;
    // Gracefully handle keytar failing to load due to missing library on Linux
    if (process.platform === 'linux') {
      keytar = {
        findPassword: function() {
          return Promise.reject();
        },
        setPassword: function() {
          return Promise.reject();
        }
      };
    } else {
      throw error;
    }
  }

  tokenName = 'inkdrop';

  KEY_ACCESS_ID = 'accessKeyId';

  getAccessKeyId = function() {
    return keytar.getPassword(tokenName, KEY_ACCESS_ID);
  };

  getSecretAccessKey = function(accessKeyId) {
    return keytar.getPassword(tokenName, accessKeyId);
  };

  module.exports = {
    // Get the Atom.io API token from the keychain.

    // callback - A function to call with an error as the first argument and a
    //            string token as the second argument.
    getToken: function(callback) {
      var accessKeyId;
      accessKeyId = null;
      return getAccessKeyId().then(function(_accessKeyId) {
        accessKeyId = _accessKeyId;
        return getSecretAccessKey(accessKeyId);
      }).then(function(accessKeySecret) {
        var token;
        if (accessKeySecret) {
          token = 'Basic ' + new Buffer(`${accessKeyId}:${accessKeySecret}`).toString('base64');
          return callback(null, token);
        } else {
          return Promise.reject();
        }
      }).catch(function() {
        var token;
        if (token = process.env.INKDROP_ACCESS_TOKEN) {
          return callback(null, token);
        } else {
          return callback("No Inkdrop API token found in keychain\nLog in first from the app or set the `INKDROP_ACCESS_TOKEN` environment variable.");
        }
      });
    },
    // Save the given token to the keychain.

    // token - A string token to save.
    saveToken: function(token) {
      return Promise.resolve();
    }
  };

  //keytar.setPassword(tokenName, 'inkdrop', token)

}).call(this);
