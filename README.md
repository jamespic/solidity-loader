solidity-standard-json-loader
=============================
A Webpack loader for Solidity. Works with dependencies (so you can
`npm install zeppelin-solidity`), and outputs Solidity standard JSON.

Install
-------

```
npm install solidity-standard-json-loader
```

Use
---

If you want to import the JSON output into Javascript code, you should use
`json-loader`. Add the following rules to your Webpack config:

```
rules: [
  {
    test: /\.sol$/,
    use: [
      {loader: 'json-loader'},
      {loader: 'solidity-standard-json-loader', options: {optimize: true}}
    ]
  }
]
```

If you want to just output the JSON to a file, you'll need to use `file-loader`.
Something like the following:

```
module.exports = {
  entry: 'MyContract.sol',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].sol.out'
  },
  module: {
    rules: [{
      test: /\.sol$/,
      use: [
        {loader: 'file-loader', options: {name: '[name].sol.json'}},
        {loader: 'solidity-standard-json-loader', options: {optimize: true}}
      ]
    }]
  }
}
```

Options
-------

The loader supports the following options:

```
{
  optimize: false, // Enable compiler optimization
  debug: false, // Emit complete compiler output, to help with debugging.
                // If this is disabled, the generated JSON will contain the minimum needed to
                // be able to deploy and call the contract with Web3.
  solcVersion: 'latest', // Compile with a different version of solc to the installed one
  links: { // Which libraries to link
    'MyLibrary.sol': {
      'LibraryContract': '0x1234567890123456789012345678901234567890'
    }
  }
}
```
