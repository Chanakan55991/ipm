# ipm - Inkdrop Package Manager

Discover and install Inkdrop packages powered by [inkdrop.app](https://my.inkdrop.app/plugins)

You can configure ipm by using the `ipm config` command line option (recommended) or by manually editing the `~/.config/inkdrop/.ipmrc` file as per the [npm config](https://docs.npmjs.com/misc/config).

## Relation to npm

ipm bundles [npm](https://github.com/npm/npm) with it and spawns `npm` processes to install Inkdrop packages. The major difference is that `ipm` sets multiple command line arguments to `npm` to ensure that native modules are built against Chromium's v8 headers instead of node's v8 headers.

The other major difference is that Inkdrop packages are installed to `~/.config/inkdrop/packages` instead of a local `node_modules` folder and Inkdrop packages are published to and installed from GitHub repositories instead of [npmjs.com](https://www.npmjs.com/)

Therefore you can think of `ipm` as a simple `npm` wrapper that builds on top of the many strengths of `npm` but is customized and optimized to be used for Inkdrop packages.

## Installing

`ipm` is bundled and installed automatically with Inkdrop. You can run the _Inkdrop > Install Shell Commands_ menu option to install it again if you aren't able to run it from a terminal (macOS only).

## Building

  * Clone the repository
  * :penguin: Install `libsecret-1-dev` (or the relevant `libsecret` development dependency) if you are on Linux
  * Run `npm install`; this will install the dependencies with your built-in version of Node/npm, and then rebuild them with the bundled versions.
  * Run `./bin/npm run build` to compile the CoffeeScript code (or `.\bin\npm.cmd run build` on Windows)
  * Run `./bin/npm test` to run the specs (or `.\bin\npm.cmd test` on Windows)

### Why `bin/npm` / `bin\npm.cmd`?

`ipm` includes `npm`, and spawns it for various processes. It also comes with a bundled version of Node, and this script ensures that npm uses the right version of Node for things like running the tests. If you're using the same version of Node as is listed in `BUNDLED_NODE_VERSION`, you can skip using this script.

## Using

Run `ipm help` to see all the supported commands and `ipm help <command>` to
learn more about a specific command.

The common commands are `ipm install <package_name>` to install a new package,
`ipm featured` to see all the featured packages, and `ipm publish` to publish
a package to [inkdrop.app](https://my.inkdrop.app/plugins).

## Two-factor authentication?

If you have 2fa enabled on your GitHub account, you'll need to generate a [personal access token](https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line/) and provide that when prompted for your password.

## Behind a firewall?

If you are behind a firewall and seeing SSL errors when installing packages
you can disable strict SSL by running:

```
ipm config set strict-ssl false
```

## Using a proxy?

If you are using a HTTP(S) proxy you can configure `ipm` to use it by running:

```
ipm config set https-proxy https://9.0.2.1:0
```

You can run `ipm config get https-proxy` to verify it has been set correctly.

## Viewing configuration

You can also run `ipm config list` to see all the custom config settings.
