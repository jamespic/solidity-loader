const fs = require('fs')
const path = require('path')
const loaderUtils = require('loader-utils')
const solc = require('solc')
const {
  NodeJsInputFileSystem,
  CachedInputFileSystem,
  ResolverFactory
} = require('enhanced-resolve')

// Work around Webpack issue #1634
const syncResolver = ResolverFactory.createResolver({
  fileSystem: new CachedInputFileSystem(new NodeJsInputFileSystem(), 4000),
  useSyncFileSystemCalls: true,
  extensions: ['.sol']
})

module.exports = function solidityLoader(source) {
  let self = this
  let callback = this.async()
  let options = loaderUtils.getOptions(this) || {}
  let debug = options.debug
  let optimize = options.optimize

  if (options.solcVersion) solc.loadRemoteVersion(options.solcVersion, compileWithSolc)
  else compileWithSolc(null, solc)

  function compileWithSolc(error, solc) {
    if (error) callback(error)
    try {
      let input = {
        language: 'Solidity',
        sources: {
          [path.relative(self.context, self.resourcePath)]: {
            content: source
          }
        },
        settings: {
          optimizer: optimize ? {enabled: true, runs: 200} : {enabled: false},
          libraries: options.links,
          outputSelection: {
            '*': {
              '*': debug ? ['*'] : ['abi', 'evm.bytecode.object', 'evm.bytecode.linkReferences'],
              '': debug ? ['*'] : []
            }
          }
        }
      }
      let output = solc.compileStandardWrapper(JSON.stringify(input), findImports)
      let warningsAndErrors = JSON.parse(output).errors || []
      let errors = warningsAndErrors.filter(x => x.severity == 'error')

      for (let err of warningsAndErrors) console.error(err.formattedMessage)

      if (errors.length > 0) {
        callback(new Error(errors.map(x => x.formattedMessage)))
      } else {
        callback(null, output)
      }

    } catch (e) {
      callback(e)
    }

  }

  function findImports(sourceName) {
    let resolved = path.resolve(self.context, sourceName)
    if (!fs.existsSync(resolved)) resolved = syncResolver.resolveSync({}, self.context, sourceName)

    self.addDependency(resolved)
    return {contents: fs.readFileSync(resolved, 'utf-8')}
  }
}
