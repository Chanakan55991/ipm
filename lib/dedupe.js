(function() {
  var Command, Dedupe, _, async, config, fs, path, yargs;

  path = require('path');

  async = require('async');

  _ = require('underscore-plus');

  yargs = require('yargs');

  config = require('./apm');

  Command = require('./command');

  fs = require('./fs');

  module.exports = Dedupe = (function() {
    class Dedupe extends Command {
      constructor() {
        super();
        this.atomDirectory = config.getAtomDirectory();
        this.atomPackagesDirectory = path.join(this.atomDirectory, 'packages');
        this.atomNodeDirectory = path.join(this.atomDirectory, '.node-gyp');
        this.atomNpmPath = require.resolve('npm/bin/npm-cli');
      }

      parseOptions(argv) {
        var options;
        options = yargs(argv).wrap(Math.min(100, yargs.terminalWidth()));
        options.usage(`
Usage: ipm dedupe [<package_name>...]

Reduce duplication in the node_modules folder in the current directory.

This command is experimental.`);
        return options.alias('h', 'help').describe('help', 'Print this usage message');
      }

      dedupeModules(options, callback) {
        process.stdout.write('Deduping modules ');
        return this.forkDedupeCommand(options, (...args) => {
          return this.logCommandResults(callback, ...args);
        });
      }

      forkDedupeCommand(options, callback) {
        var dedupeArgs, dedupeOptions, env, i, len, packageName, ref, vsArgs;
        dedupeArgs = ['--globalconfig', config.getGlobalConfigPath(), '--userconfig', config.getUserConfigPath(), 'dedupe'];
        dedupeArgs.push(...this.getNpmBuildFlags());
        if (options.argv.silent) {
          dedupeArgs.push('--silent');
        }
        if (options.argv.quiet) {
          dedupeArgs.push('--quiet');
        }
        if (vsArgs = this.getVisualStudioFlags()) {
          dedupeArgs.push(vsArgs);
        }
        ref = options.argv._;
        for (i = 0, len = ref.length; i < len; i++) {
          packageName = ref[i];
          dedupeArgs.push(packageName);
        }
        fs.makeTreeSync(this.atomDirectory);
        env = _.extend({}, process.env, {
          HOME: this.atomNodeDirectory,
          RUSTUP_HOME: config.getRustupHomeDirPath()
        });
        this.addBuildEnvVars(env);
        dedupeOptions = {env};
        if (options.cwd) {
          dedupeOptions.cwd = options.cwd;
        }
        return this.fork(this.atomNpmPath, dedupeArgs, dedupeOptions, callback);
      }

      createAtomDirectories() {
        fs.makeTreeSync(this.atomDirectory);
        return fs.makeTreeSync(this.atomNodeDirectory);
      }

      run(options) {
        var callback, commands, cwd;
        ({callback, cwd} = options);
        options = this.parseOptions(options.commandArgs);
        options.cwd = cwd;
        this.createAtomDirectories();
        commands = [];
        commands.push((callback) => {
          return this.loadInstalledAtomMetadata(callback);
        });
        commands.push((callback) => {
          return this.dedupeModules(options, callback);
        });
        return async.waterfall(commands, callback);
      }

    };

    Dedupe.commandNames = ['dedupe'];

    return Dedupe;

  }).call(this);

}).call(this);
