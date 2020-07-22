(function() {
  var Command, Install, Rebuild, _, config, fs, path, yargs;

  path = require('path');

  _ = require('underscore-plus');

  yargs = require('yargs');

  config = require('./apm');

  Command = require('./command');

  fs = require('./fs');

  Install = require('./install');

  module.exports = Rebuild = (function() {
    class Rebuild extends Command {
      constructor() {
        super();
        this.atomDirectory = config.getAtomDirectory();
        this.atomNodeDirectory = path.join(this.atomDirectory, '.node-gyp');
        this.atomNpmPath = require.resolve('npm/bin/npm-cli');
      }

      parseOptions(argv) {
        var options;
        options = yargs(argv).wrap(Math.min(100, yargs.terminalWidth()));
        options.usage(`
Usage: ipm rebuild [<name> [<name> ...]]

Rebuild the given modules currently installed in the node_modules folder
in the current working directory.

All the modules will be rebuilt if no module names are specified.`);
        return options.alias('h', 'help').describe('help', 'Print this usage message');
      }

      forkNpmRebuild(options, callback) {
        var env, rebuildArgs, vsArgs;
        process.stdout.write('Rebuilding modules ');
        rebuildArgs = ['--globalconfig', config.getGlobalConfigPath(), '--userconfig', config.getUserConfigPath(), 'rebuild'];
        rebuildArgs.push(...this.getNpmBuildFlags());
        rebuildArgs.push(...options.argv._);
        if (vsArgs = this.getVisualStudioFlags()) {
          rebuildArgs.push(vsArgs);
        }
        fs.makeTreeSync(this.atomDirectory);
        env = _.extend({}, process.env, {
          HOME: this.atomNodeDirectory,
          RUSTUP_HOME: config.getRustupHomeDirPath()
        });
        this.addBuildEnvVars(env);
        return this.fork(this.atomNpmPath, rebuildArgs, {env}, callback);
      }

      run(options) {
        var callback;
        ({callback} = options);
        options = this.parseOptions(options.commandArgs);
        return config.loadNpm((error, npm) => {
          this.npm = npm;
          return this.loadInstalledAtomMetadata(() => {
            return this.forkNpmRebuild(options, (code, stderr = '') => {
              if (code === 0) {
                this.logSuccess();
                return callback();
              } else {
                this.logFailure();
                return callback(stderr);
              }
            });
          });
        });
      }

    };

    Rebuild.commandNames = ['rebuild'];

    return Rebuild;

  }).call(this);

}).call(this);
