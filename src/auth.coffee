try
  keytar = require 'keytar'
catch error
  # Gracefully handle keytar failing to load due to missing library on Linux
  if process.platform is 'linux'
    keytar =
      findPassword: ->
      replacePassword: ->
  else
    throw error

tokenName = 'Inkdrop API Token'

module.exports =
  # Get the Atom.io API token from the keychain.
  #
  # callback - A function to call with an error as the first argument and a
  #            string token as the second argument.
  getToken: (callback) ->
    if token = keytar.findPassword(tokenName)
      callback(null, token)
      return

    if token = process.env.ATOM_ACCESS_TOKEN
      callback(null, token)
      return

    callback """
      No Inkdrop API token in keychain
      Run `ipm login` or set the `ATOM_ACCESS_TOKEN` environment variable.
    """

  # Save the given token to the keychain.
  #
  # token - A string token to save.
  saveToken: (token) ->
    keytar.replacePassword(tokenName, 'inkdrop', token)
