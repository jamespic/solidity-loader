pragma solidity 0.4.19;

contract Error {
  function f() returns (uint) {
    return 1 // No semicolon
  }
}
