const Token = artifacts.require("Token");
const EthSwap = artifacts.require("EthSwap");

require('chai')
   .use(require('chai-as-promised'))
   .should()

function tokens(n){
    return web3.utils.toWei(n,'ether');
}   

contract('EthSwap',([deployer,investor])=>{
    let token,ethSwap
    before(async()=>{
         token = await Token.new();
         ethSwap = await EthSwap.new(token.address);
        await token.transfer(ethSwap.address,tokens('1000000'));
    })

    describe('Token Deployment',async ()=>{
        it('contract has a name', async()=>{
            const name = await token.name();
            assert.equal(name,'DApp Token')
        })
    })
    describe('EthSwap Deployment',async ()=>{
        it('contract has a name', async()=>{ 
            const name = await ethSwap.name();
            assert.equal(name,'EthSwap Instant Exchange')
        })
        it('EthSwap Contract has token',async()=>{  
            let balance = await token.balanceOf(ethSwap.address)
            assert.equal(balance.toString(),tokens('1000000'))  
        })
    })
    describe('buyTokens()',async()=>{
        let result
        before(async ()=>{
          result = await ethSwap.buyTokens({from:investor,value:web3.utils.toWei('1','ether')})
        })
        it("Allows users to instantly purchase tokens for fixed price",async()=>{
            let investorBalance = await token.balanceOf(investor);
            assert.equal(investorBalance.toString(),tokens('1000'));

            let ethSwapBalance
             ethSwapBalance = await token.balanceOf(ethSwap.address);
            assert.equal(ethSwapBalance.toString(),tokens('999000'))
            ethSwapBalance = await web3.eth.getBalance(ethSwap.address)
            assert.equal(ethSwapBalance.toString(),web3.utils.toWei('1','ether'))
            const event = result.logs[0].args;
            assert.equal(event.account,investor)
            assert.equal(event.token,token.address)
            assert.equal(event.amount.toString(),tokens('1000').toString())
            assert.equal(event.rate.toString(),'1000')

        })

    })
    describe('sellTokens()',async()=>{
        let result
        before(async ()=>{
            await token.approve(ethSwap.address,tokens('1000'),{from:investor})
            result = await ethSwap.sellTokens(tokens('1000'),{from:investor});
        })
        it("Allows users to instantly sell tokens to EthSwap for fixed price",async()=>{
            let investorBalance = await token.balanceOf(investor);
            assert.equal(investorBalance.toString(),tokens('0'));

            
            let ethSwapBalance
             ethSwapBalance = await token.balanceOf(ethSwap.address);
            assert.equal(ethSwapBalance.toString(),tokens('1000000'))
            ethSwapBalance = await web3.eth.getBalance(ethSwap.address)
            assert.equal(ethSwapBalance.toString(),web3.utils.toWei('0','ether'))

            const event = result.logs[0].args;
            assert.equal(event.account,investor)
            assert.equal(event.token,token.address)
            assert.equal(event.amount.toString(),tokens('1000').toString())
            assert.equal(event.rate.toString(),'1000')
            
            await ethSwap.sellTokens(tokens('5000'),{from:investor}).should.be.rejected;
        })

    })
})   