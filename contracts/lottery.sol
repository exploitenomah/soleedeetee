// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

contract Lottery {
  address public manager;
  address payable[] public players;
  address public winner;

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

  function pickWinner() public payable restricted returns(address) {
    require(players.length > 0);
    uint winnerIndex = random() % players.length;
    players[winnerIndex].transfer(address(this).balance);
    winner = players[winnerIndex];
    return players[winnerIndex];
  }
  
  function resetLottery() public restricted {
    require(msg.sender == manager);
    players = new address payable[](0);
    winner = address(0);
  }

  modifier restricted() {
    require(msg.sender == manager);
    _;
  }

}