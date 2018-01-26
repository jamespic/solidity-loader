pragma solidity 0.4.19;

library DoIt {
  function x() public pure returns (uint) {
    return 1;
  }
}

contract Doer {
  function y() public pure returns (uint) {
    return DoIt.x();
  }
}
