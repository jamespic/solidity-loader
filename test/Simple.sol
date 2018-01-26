pragma solidity 0.4.19;

contract Simple {
  function () public payable {}
  function withdraw(uint amount) public {
    msg.sender.transfer(amount);
  }
}
