// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

contract Lottery {
  address public manager;
  address payable[] public players;

   constructor() {
    manager = msg.sender;
  }

  function enter() public payable{
    require(msg.value > 0.01 ether);
    players.push(payable(msg.sender));
  }

  function random() private view returns (uint) {
   return uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, players)));
  }
  
  function getPlayers() public view returns (address payable[] memory){
    return players;
  }

  function pickWinner() public {
    require(msg.sender == manager);
    require(players.length > 1);
    uint winnerIndex = random() % players.length;
    players[winnerIndex].transfer(address(this).balance);
    players = new address payable[](0);
  }
}