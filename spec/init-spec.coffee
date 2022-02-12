path = require 'path'
temp = require 'temp'
CSON = require 'season'
apm = require '../lib/apm-cli'
fs = require '../lib/fs'

describe "apm init", ->
  [packagePath, themePath, languagePath] = []

  beforeEach ->
    silenceOutput()
    spyOnToken()

    currentDir = temp.mkdirSync('apm-init-')
    spyOn(process, 'cwd').andReturn(currentDir)
    packagePath = path.join(currentDir, 'fake-package')
    themePath = path.join(currentDir, 'fake-theme')
    languagePath = path.join(currentDir, 'language-fake')
    process.env.GITHUB_USER = 'somebody'

  describe "when creating a package", ->
    describe "when package syntax is JavaScript", ->
      it "generates the proper file structure", ->
        callback = jasmine.createSpy('callback')
        apm.run(['init', '--syntax', 'javascript', '--package', 'fake-package'], callback)

        waitsFor 'waiting for init to complete', ->
          callback.callCount is 1

        runs ->
          expect(fs.existsSync(packagePath)).toBeTruthy()
          expect(fs.existsSync(path.join(packagePath, 'keymaps'))).toBeTruthy()
          expect(fs.existsSync(path.join(packagePath, 'keymaps', 'fake-package.json'))).toBeTruthy()
          expect(fs.existsSync(path.join(packagePath, 'lib'))).toBeTruthy()
          expect(fs.existsSync(path.join(packagePath, 'lib', 'fake-package-message-dialog.js'))).toBeTruthy()
          expect(fs.existsSync(path.join(packagePath, 'lib', 'fake-package.js'))).toBeTruthy()
          expect(fs.existsSync(path.join(packagePath, 'menus'))).toBeTruthy()
          expect(fs.existsSync(path.join(packagePath, 'menus', 'fake-package.json'))).toBeTruthy()
          expect(fs.existsSync(path.join(packagePath, 'styles', 'fake-package.less'))).toBeTruthy()
          expect(fs.existsSync(path.join(packagePath, 'package.json'))).toBeTruthy()
          expect(JSON.parse(fs.readFileSync(path.join(packagePath, 'package.json'))).name).toBe 'fake-package'
          expect(JSON.parse(fs.readFileSync(path.join(packagePath, 'package.json'))).repository).toBe 'https://github.com/somebody/fake-package'

    describe "when package syntax is unsupported", ->
      it "logs an error", ->
        callback = jasmine.createSpy('callback')
        apm.run(['init', '--syntax', 'something-unsupported', '--package', 'fake-package'], callback)

        waitsFor 'waiting for init to complete', ->
          callback.callCount is 1

        runs ->
          expect(callback.argsForCall[0][0].length).toBeGreaterThan 0

  describe "when creating a theme", ->
    it "generates the proper file structure", ->
      callback = jasmine.createSpy('callback')
      apm.run(['init', '--theme', 'fake-theme'], callback)

      waitsFor 'waiting for init to complete', ->
        callback.callCount is 1

      runs ->
        expect(fs.existsSync(themePath)).toBeTruthy()
        expect(fs.existsSync(path.join(themePath, 'styles'))).toBeTruthy()
        expect(fs.existsSync(path.join(themePath, 'styles', 'base.less'))).toBeTruthy()
        expect(fs.existsSync(path.join(themePath, 'styles', 'syntax-variables.less'))).toBeTruthy()
        expect(fs.existsSync(path.join(themePath, 'index.less'))).toBeTruthy()
        expect(fs.existsSync(path.join(themePath, 'README.md'))).toBeTruthy()
        expect(fs.existsSync(path.join(themePath, 'package.json'))).toBeTruthy()
        expect(JSON.parse(fs.readFileSync(path.join(themePath, 'package.json'))).name).toBe 'fake-theme'
        expect(JSON.parse(fs.readFileSync(path.join(themePath, 'package.json'))).repository).toBe 'https://github.com/somebody/fake-theme'
