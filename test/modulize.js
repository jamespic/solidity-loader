module.exports = function modulize(code) {
  let sandbox = {exports: {}}
  let wrappedCode = `void function(module, exports) { ${ code } }(sandbox, sandbox.exports)`
  eval(wrappedCode)
  return sandbox.exports
}
