const {expect} = require('chai')

const compiler = require('./compiler.js')
const modulize = require('./modulize.js')

describe('solidity-loader', function() {
  this.timeout(5000)
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
  it('can use older compiler versions', async function() {
    this.timeout(30000)
    let result = await compiler('Old.sol', {solcVersion: 'v0.3.2+commit.81ae2a7'})
    let output = modulize(result.toJson().modules[0].source)
    expect(output.errors).to.be.empty
  })
  it('can link libraries', async function() {
    let result = await compiler('Library.sol', {links: {'Library.sol':{'DoIt': '0x1234567890123456789012345678901234567890'}}})
    let output = modulize(result.toJson().modules[0].source)
    expect(output.contracts['Library.sol'].Doer.evm.bytecode.object).not.to.match(/__Library\.sol:DoIt_+/)
    expect(output.contracts['Library.sol'].Doer.evm.bytecode.object).to.match(/1234567890123456789012345678901234567890/)
  })
  it('can leave libraries unlinked', async function() {
    let result = await compiler('Library.sol')
    let output = modulize(result.toJson().modules[0].source)
    expect(output.contracts['Library.sol'].Doer.evm.bytecode.object).to.match(/__Library\.sol:DoIt_+/)
  })
  it('will continue on warnings', async function() {
    let result = await compiler('Warning.sol')
    let output = modulize(result.toJson().modules[0].source)
    expect(output).to.have.nested.property('contracts.Warning\\.sol.Warning.abi')
    expect(result.toJson().errors).to.be.empty
  })
  it('will throw on errors', async function() {
    let result = await compiler('Error.sol')
    expect(result.toJson().errors).not.to.be.empty
  })
})
