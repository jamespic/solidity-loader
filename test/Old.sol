contract Old {
  function x() {
    msg.sender.call.value(msg.value)(); // Will error on recent Solidity compilers
  }
}
