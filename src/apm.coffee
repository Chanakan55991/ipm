child_process = require 'child_process'
fs = require './fs'
path = require 'path'
npm = require 'npm'
semver = require 'semver'

module.exports =
  getHomeDirectory: ->
    if process.platform is 'win32' then process.env.USERPROFILE else process.env.HOME

  getAtomDirectory: ->
    process.env.ATOM_HOME ? path.join(@getAppDataPath(), 'inkdrop')

  getCacheDirectory: ->
    path.join(@getAtomDirectory(), '.ipm')

  getAppDataPath: ->
    switch process.platform
      when 'darwin'
        path.join process.env.HOME, 'Library', 'Application Support'
      when 'linux'
        path.join process.env.HOME, '.config'
      when 'win32'
        process.env.APPDATA

  getResourcePath: (callback) ->
    if process.env.ATOM_RESOURCE_PATH
      return process.nextTick -> callback(process.env.ATOM_RESOURCE_PATH)

    apmFolder = path.resolve(__dirname, '..')
    appFolder = path.dirname(apmFolder)
    if path.basename(apmFolder) is 'ipm' and path.basename(appFolder) is 'app'
      asarPath = "#{appFolder}.asar"
      if fs.existsSync(asarPath)
        return process.nextTick -> callback(asarPath)

    apmFolder = path.resolve(__dirname, '..', '..', '..')
    appFolder = path.dirname(apmFolder)
    if path.basename(apmFolder) is 'ipm' and path.basename(appFolder) is 'app'
      asarPath = "#{appFolder}.asar"
      if fs.existsSync(asarPath)
        return process.nextTick -> callback(asarPath)

    switch process.platform
      when 'darwin'
        child_process.exec 'mdfind "kMDItemCFBundleIdentifier == \'info.pkpk.inkdrop\'"', (error, stdout='', stderr) ->
          [appLocation] = stdout.split('\n') unless error
          appLocation = '/Applications/Inkdrop.app' unless appLocation
          callback("#{appLocation}/Contents/Resources/app.asar")
      when 'linux'
        appLocation = '/usr/local/share/inkdrop/resources/app.asar'
        unless fs.existsSync(appLocation)
          appLocation = '/usr/share/inkdrop/resources/app.asar'
        process.nextTick -> callback(appLocation)
      when 'win32'
        process.nextTick ->
          programFilesPath = path.join(process.env.ProgramFiles, 'Inkdrop', 'resources', 'app.asar')
          callback(programFilesPath)

  getReposDirectory: ->
    process.env.ATOM_REPOS_HOME ? path.join(@getHomeDirectory(), 'github')

  getElectronUrl: ->
    process.env.ATOM_ELECTRON_URL ? 'https://atom.io/download/atom-shell'

  getAtomPackagesUrl: ->
    process.env.ATOM_PACKAGES_URL ? "#{@getAtomApiUrl()}/packages"

  getAtomApiUrl: ->
    process.env.ATOM_API_URL ? 'https://www.inkdrop.info/api/v1'

  getElectronArch: ->
    switch process.platform
      when 'darwin' then 'x64'
      when 'win32' then 'ia32'
      else process.arch  # On BSD and Linux we use current machine's arch.

  getUserConfigPath: ->
    path.resolve(@getAtomDirectory(), '.ipmrc')

  getGlobalConfigPath: ->
    path.resolve(@getAtomDirectory(), '.ipm', '.ipmrc')

  isWin32: ->
    process.platform is 'win32'

  isWindows64Bit: ->
    fs.existsSync "C:\\Windows\\SysWow64\\Notepad.exe"

  x86ProgramFilesDirectory: ->
    process.env["ProgramFiles(x86)"] or process.env["ProgramFiles"]

  getInstalledVisualStudioFlag: ->
    return null unless @isWin32()

    # Use the explictly-configured version when set
    return process.env.GYP_MSVS_VERSION if process.env.GYP_MSVS_VERSION

    return '2015' if @visualStudioIsInstalled("14.0")
    return '2013' if @visualStudioIsInstalled("12.0")
    return '2012' if @visualStudioIsInstalled("11.0")
    return '2010' if @visualStudioIsInstalled("10.0")

  visualStudioIsInstalled: (version) ->
    fs.existsSync(path.join(@x86ProgramFilesDirectory(), "Microsoft Visual Studio #{version}", "Common7", "IDE"))

  loadNpm: (callback) ->
    npmOptions =
      userconfig: @getUserConfigPath()
      globalconfig: @getGlobalConfigPath()
    npm.load npmOptions, -> callback(null, npm)

  getSetting: (key, callback) ->
    @loadNpm -> callback(npm.config.get(key))

  setupApmRcFile: ->
    try
      fs.writeFileSync @getGlobalConfigPath(), """
        ; This file is auto-generated and should not be edited since any
        ; modifications will be lost the next time any apm command is run.
        ;
        ; You should instead edit your .apmrc config located in ~/.atom/.apmrc
        cache = #{@getCacheDirectory()}
        ; Hide progress-bar to prevent npm from altering apm console output.
        progress = false
      """
