try
  keytar = require 'keytar'
catch error
  # Gracefully handle keytar failing to load due to missing library on Linux
  if process.platform is 'linux'
    keytar =
      findPassword: -> Promise.reject()
      setPassword: -> Promise.reject()
  else
    throw error

tokenName = 'inkdrop'
KEY_ACCESS_ID = 'accessKeyId'

getAccessKeyId = ->
  keytar.getPassword(tokenName, KEY_ACCESS_ID)

getSecretAccessKey = (accessKeyId) ->
  keytar.getPassword(tokenName, accessKeyId)

module.exports =
  # Get the Atom.io API token from the keychain.
  #
  # callback - A function to call with an error as the first argument and a
  #            string token as the second argument.
  getToken: (callback) ->
    accessKeyId = null
    getAccessKeyId()
      .then (_accessKeyId) ->
        accessKeyId = _accessKeyId
        getSecretAccessKey(accessKeyId)
      .then (accessKeySecret) ->
        if accessKeySecret
          token = 'Basic ' + new Buffer("#{accessKeyId}:#{accessKeySecret}").toString('base64')
          callback(null, token)
        else
          Promise.reject()
      .catch ->
        if token = process.env.INKDROP_ACCESS_TOKEN
          callback(null, token)
        else
          callback """
            No Inkdrop API token found in keychain
            Log in first from the app or set the `INKDROP_ACCESS_TOKEN` environment variable.
          """

  # Save the given token to the keychain.
  #
  # token - A string token to save.
  saveToken: (token) ->
    Promise.resolve()
    #keytar.setPassword(tokenName, 'inkdrop', token)
