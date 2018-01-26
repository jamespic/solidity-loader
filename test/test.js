const {expect} = require('chai')

const compiler = require('./compiler.js')
const modulize = require('./modulize.js')

describe('solidity-loader', function() {
  it('compiles simple solidity files', async function() {
    let result = await compiler('Simple.sol')
    let output = modulize(result.toJson().modules[0].source)
    expect(output).to.have.nested.property('sources.Simple\\.sol.id')
    expect(output).to.have.nested.property('contracts.Simple\\.sol.Simple.abi')
    expect(output).to.have.nested.property('contracts.Simple\\.sol.Simple.evm.bytecode.object')
    expect(output).to.have.nested.property('contracts.Simple\\.sol.Simple.evm.bytecode.linkReferences')
  })
  it('adds extra debug fields when requested', async function() {
    let result = await compiler('Simple.sol', {debug: true})
    let output = modulize(result.toJson().modules[0].source)
    // Focus on the ones useful for debugging
    expect(output).to.have.nested.property('contracts.Simple\\.sol.Simple.evm.deployedBytecode.sourceMap')
    expect(output).to.have.nested.property('contracts.Simple\\.sol.Simple.evm.methodIdentifiers')
    expect(output).to.have.nested.property('contracts.Simple\\.sol.Simple.metadata')
    expect(output).to.have.nested.property('sources.Simple\\.sol.ast')
    expect(output).to.have.nested.property('sources.Simple\\.sol.legacyAST')
    expect(JSON.parse(output.contracts['Simple.sol'].Simple.metadata).settings.optimizer.enabled).to.equal(false)
  })
  it('optimizes, when configured to do so', async function() {
    let result = await compiler('Simple.sol', {debug: true, optimize: true})
    let output = modulize(result.toJson().modules[0].source)
    // Focus on the ones useful for debugging
    expect(JSON.parse(output.contracts['Simple.sol'].Simple.metadata).settings.optimizer.enabled).to.equal(true)
  })
  it('handles local imports', async function() {
    let result = await compiler('HasImport.sol')
    let output = modulize(result.toJson().modules[0].source)
    expect(output).to.have.nested.property('sources.Simple\\.sol.id')
    expect(output).to.have.nested.property('contracts.Simple\\.sol.Simple.abi')
    expect(output).to.have.nested.property('sources.HasImport\\.sol.id')
    expect(output).to.have.nested.property('contracts.HasImport\\.sol.HasImport.abi')
  })
  it('handles external imports', async function() {
    let result = await compiler('ImportsExternal.sol')
    let output = modulize(result.toJson().modules[0].source)
    expect(output).to.have.nested.property('sources.ImportsExternal\\.sol.id')
    expect(output).to.have.nested.property('contracts.ImportsExternal\\.sol.ImportsExternal.abi')
    expect(output).to.have.nested.property('sources.zeppelin-solidity/contracts/ownership/Ownable\\.sol.id')
    expect(output).to.have.nested.property('contracts.zeppelin-solidity/contracts/ownership/Ownable\\.sol.Ownable.abi')
  })
})
