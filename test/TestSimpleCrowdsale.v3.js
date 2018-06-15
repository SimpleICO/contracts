import ether from 'openzeppelin-solidity/test/helpers/ether';
// import decodeLogs from 'openzeppelin-solidity/test/helpers/decodeLogs';
import EVMRevert from 'openzeppelin-solidity/test/helpers/EVMRevert';
import axios from 'axios';

const BigNumber = web3.BigNumber;

const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const SimpleCrowdsale = artifacts.require('SimpleCrowdsale.sol');
const SimpleToken = artifacts.require('SimpleToken.sol');

contract('SimpleCrowdsale', ([wallet, investor]) => {

    console.log(`CREATOR: ${wallet}`);
    console.log(`INVESTOR: ${investor}`);

    const NAME = 'My Simple Token';
    const SYMBOL = 'MST';
    const DECIMALS = 18;
    const RATE = 1;
    const TOKEN_SUPPLY = 100;
    const TOKEN_ETH_PRICE = ether('0.001');
    const INVESTMENT = ether('0.0025');

    async function convertCurrency(currency, to, amount){
        return axios
            .get(`https://min-api.cryptocompare.com/data/price?fsym=${currency}&tsyms=${to}`);
    }

    before(async function () {
        console.log(`TOKEN PRICE WEI: ${TOKEN_ETH_PRICE}`);
        console.log(`TOKEN PRICE ETH: ${web3.fromWei(TOKEN_ETH_PRICE)}`);
        console.log(`TOKENS PER PRICE ${web3.fromWei(1e18)}`);

        let walletBalance = await web3.eth.getBalance(wallet);
        let investorBalance = await web3.eth.getBalance(investor);
        console.log(`WALLET ETH BALANCE: ${web3.fromWei(walletBalance.valueOf(), 'ether')}`);
        console.log(`INVESTOR ETH BALANCE: ${web3.fromWei(investorBalance.valueOf(), 'ether')}`);

        this.token = await SimpleToken.new(NAME, SYMBOL, DECIMALS, TOKEN_SUPPLY, { from: wallet });
        this.crowdsale = await SimpleCrowdsale.new(TOKEN_ETH_PRICE, RATE, wallet, this.token.address, { from: wallet });

        const totalSupply = await this.token.totalSupply();

        await this.token.transfer(this.crowdsale.address, totalSupply);
    });

    // beforeEach(async function () {
    // });

    describe('Deploy an ERC20 token crowdsale', () => {
        it('should create crowdsale with correct parameters', async function () {
            this.crowdsale.should.exist;
            this.token.should.exist;

            const rate = await this.crowdsale.rate();
            const walletAddress = await this.crowdsale.wallet();
            const price = await this.crowdsale.price();

            console.log(rate.valueOf(), walletAddress, price.toString());

            rate.should.be.bignumber.equal(RATE);
            walletAddress.should.be.equal(wallet);
            price.toString().should.be.equal(TOKEN_ETH_PRICE.toString());
        });

        it('should create ERC20 token with correct parameters', async function () {
            const name = await this.token.name();
            const totalSupply = await this.token.totalSupply();

            console.log(`TOKEN SUPPLY ${totalSupply.valueOf()}`); 

            console.log(name, totalSupply.valueOf());
        });
    })

    describe('accepting payments', function () {
        it('should accept payments', async function () {
            let crowdsaleTokensBalance = await this.token.balanceOf(this.crowdsale.address);
            let walletTokensBalance = await this.token.balanceOf(wallet);
            let investorTokenBalance = await this.token.balanceOf(investor);

            console.log(`CROWDSALE TOKEN BALANCE: ${crowdsaleTokensBalance.valueOf()}`);
            console.log(`WALLET TOKEN BALANCE: ${walletTokensBalance.valueOf()}`);
            console.log(`INVESTOR TOKEN BALANCE: ${investorTokenBalance.valueOf()}`);

            console.log(`TOKEN/PRICE REMAINDER: ${TOKEN_ETH_PRICE.mod(INVESTMENT).toString()}`);

            let investment = INVESTMENT;

            // if (investment.gt(crowdsaleTokensBalance)) {
            //     console.log(`TOKEN CAP REACHED, PURCHASE SHOULD FAIL`);
            //     await this.crowdsale.buyTokens(investor, { value: investment, from: investor }).should.be.rejectedWith(EVMRevert);
            // } else {
            // }
            await this.crowdsale.buyTokens(investor, { value: investment, from: investor }).should.be.fulfilled;

            console.log(this.crowdsale.transactionHash);
            const receipt = web3.eth.getTransactionReceipt(this.crowdsale.transactionHash);
            // const logs = decodeLogs(receipt.logs, SimpleCrowdsale, this.crowdsale.address);
            // console.log(logs);

            let weiRaised = await this.crowdsale.weiRaised();
            let weiRaisedInEth = web3.fromWei(weiRaised, 'ether');

            console.log(`WEI RAISED: ${weiRaised.valueOf()}`);
            console.log(`WEI RAISED IN ETH: ${weiRaisedInEth}`);
            // let ethPrice = await convertCurrency('ETH', 'USD');
            // console.log(`ETH PRICE IN USD: ${ethPrice.data.USD}`);
            // console.log(`USD RAISED SO FAR: ${weiRaisedInEth * ethPrice.data.USD}`);

            var walletBalance = await web3.eth.getBalance(wallet);
            var investorBalance = await web3.eth.getBalance(investor);
            console.log(`WALLET ETH BALANCE: ${web3.fromWei(walletBalance.valueOf(), 'ether')}`);
            console.log(`INVESTOR ETH BALANCE: ${web3.fromWei(investorBalance.valueOf(), 'ether')}`);

            crowdsaleTokensBalance = await this.token.balanceOf(this.crowdsale.address);
            investorTokenBalance = await this.token.balanceOf(investor);
            console.log(`INVESTOR TOKEN BALANCE: ${investorTokenBalance.valueOf()}`);
            console.log(`CROWDSALE TOKEN BALANCE: ${crowdsaleTokensBalance.valueOf()}`);
        });
    });
});



