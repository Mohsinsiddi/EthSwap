pragma solidity >=0.4.21 <0.7.0;
import "./Token.sol";
contract EthSwap{
    string public name="EthSwap Instant Exchange";
    Token public token;
    uint public rate=1000;

    event TokenPurchased(
        address account,
        address token,
        uint amount,
        uint rate
    );
    event TokenSold(
        address account,
        address token,
        uint amount,
        uint rate
    );

    constructor(Token _token) public {
        token = _token;
    }
   function buyTokens() external payable{
       uint tokenAmount = msg.value * rate;
       require(token.balanceOf(address(this)) >= tokenAmount,"EthSwap pool dont have enough tokens");
       token.transfer(msg.sender,tokenAmount);
       emit TokenPurchased(msg.sender,address(token),tokenAmount,rate);
   }
   function sellTokens(uint _amount) external {
       require(token.balanceOf(msg.sender)>=_amount,"You dont have enough tokens");
       uint ethAmount = _amount/rate;
       require(address(this).balance>=ethAmount,"EthSwap donest have enough balance");
       token.transferFrom(msg.sender,address(this),_amount);
       msg.sender.transfer(ethAmount);
        emit TokenSold(msg.sender,address(token),_amount,rate);
   }

}