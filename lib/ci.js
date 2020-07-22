(function() {
  var Ci, Command, _, async, config, fs, path, yargs;

  path = require('path');

  fs = require('./fs');

  yargs = require('yargs');

  async = require('async');

  _ = require('underscore-plus');

  config = require('./apm');

  Command = require('./command');

  module.exports = Ci = (function() {
    class Ci extends Command {
      constructor() {
        super();
        this.atomDirectory = config.getAtomDirectory();
        this.atomNodeDirectory = path.join(this.atomDirectory, '.node-gyp');
        this.atomNpmPath = require.resolve('npm/bin/npm-cli');
      }

      parseOptions(argv) {
        var options;
        options = yargs(argv).wrap(Math.min(100, yargs.terminalWidth()));
        options.usage(`Usage: ipm ci

Install a package with a clean slate.

If you have an up-to-date package-lock.json file created by ipm install,
ipm ci will install its locked contents exactly. It is substantially
faster than ipm install and produces consistently reproduceable builds,
but cannot be used to install new packages or dependencies.`);
        options.alias('h', 'help').describe('help', 'Print this usage message');
        return options.boolean('verbose').default('verbose', false).describe('verbose', 'Show verbose debug information');
      }

      installModules(options, callback) {
        var env, installArgs, installOptions, vsArgs;
        process.stdout.write('Installing locked modules');
        if (options.argv.verbose) {
          process.stdout.write('\n');
        } else {
          process.stdout.write(' ');
        }
        installArgs = ['ci', '--globalconfig', config.getGlobalConfigPath(), '--userconfig', config.getUserConfigPath(), ...this.getNpmBuildFlags()];
        if (options.argv.verbose) {
          installArgs.push('--verbose');
        }
        if (vsArgs = this.getVisualStudioFlags()) {
          installArgs.push(vsArgs);
        }
        fs.makeTreeSync(this.atomDirectory);
        env = _.extend({}, process.env, {
          HOME: this.atomNodeDirectory,
          RUSTUP_HOME: config.getRustupHomeDirPath()
        });
        this.addBuildEnvVars(env);
        installOptions = {
          env,
          streaming: options.argv.verbose
        };
        return this.fork(this.atomNpmPath, installArgs, installOptions, (...args) => {
          return this.logCommandResults(callback, ...args);
        });
      }

      run(options) {
        var callback, commands, iteratee, opts;
        ({callback} = options);
        opts = this.parseOptions(options.commandArgs);
        commands = [];
        commands.push((callback) => {
          return config.loadNpm((error, npm) => {
            this.npm = npm;
            return callback(error);
          });
        });
        commands.push((cb) => {
          return this.loadInstalledAtomMetadata(cb);
        });
        commands.push((cb) => {
          return this.installModules(opts, cb);
        });
        iteratee = function(item, next) {
          return item(next);
        };
        return async.mapSeries(commands, iteratee, function(err) {
          if (err) {
            return callback(err);
          }
          return callback(null);
        });
      }

    };

    Ci.commandNames = ['ci'];

    return Ci;

  }).call(this);

}).call(this);
