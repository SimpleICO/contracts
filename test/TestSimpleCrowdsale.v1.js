import ether from 'openzeppelin-solidity/test/helpers/ether';
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
    const RATE = new BigNumber(1);
    const TOKEN_SUPPLY = new BigNumber('1e22');
    const TOKEN_USD_PRICE = 1.00;
    const MAX_USD_CAP = 100.00;
    const INVESTMENT = 200.00;

    async function convertCurrency(currency, to, amount){
        return axios
            .get(`https://min-api.cryptocompare.com/data/price?fsym=${currency}&tsyms=${to}`);
    }

    before(async function () {
        let value = await convertCurrency('USD', 'ETH');
        this.value = ether(value.data.ETH);
        this.tokenSupply = ether(value.data.ETH * MAX_USD_CAP);
        // this.value = ether(3);
        console.log(`WEI ${this.value.valueOf()}`); // US$ 1.00 in wei
        console.log(`TOKEN SUPPLY ${this.tokenSupply}`); // US$ 1.00 in wei

        let walletBalance = await web3.eth.getBalance(wallet);
        let investorBalance = await web3.eth.getBalance(investor);
        console.log(`WALLET ETH BALANCE: ${walletBalance.valueOf()}`);
        console.log(`INVESTOR ETH BALANCE: ${investorBalance.valueOf()}`);

        this.token = await SimpleToken.new(NAME, SYMBOL, DECIMALS, this.tokenSupply, { from: wallet });
        this.crowdsale = await SimpleCrowdsale.new(RATE, wallet, this.token.address, { from: wallet });
        await this.token.transfer(this.crowdsale.address, this.tokenSupply);
    });

    // beforeEach(async function () {
    // });

    describe('Deploy an ERC20 token crowdsale', () => {
        it('should create crowdsale with correct parameters', async function () {
            this.crowdsale.should.exist;
            this.token.should.exist;

            const rate = await this.crowdsale.rate();
            const walletAddress = await this.crowdsale.wallet();

            console.log(rate.valueOf(), walletAddress);

            rate.should.be.bignumber.equal(RATE);
            walletAddress.should.be.equal(wallet);
        });

        it('should create ERC20 token with correct parameters', async function () {
            const name = await this.token.name();
            const totalSupply = await this.token.totalSupply();

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

            let investment = this.value.mul(INVESTMENT);

            if (investment.gt(crowdsaleTokensBalance)) {
                console.log(`TOKEN CAP REACHED, PURCHASE SHOULD FAIL`);
                await this.crowdsale.buyTokens(investor, { value: investment, from: investor }).should.be.rejectedWith(EVMRevert);
            } else {
                await this.crowdsale.buyTokens(investor, { value: investment, from: investor }).should.be.fulfilled;
            }

            let weiRaised = await this.crowdsale.weiRaised();
            let weiRaisedInEth = web3.fromWei(weiRaised, 'ether');

            console.log(`WEI RAISED IN ETH: ${weiRaisedInEth}`);
            let ethPrice = await convertCurrency('ETH', 'USD');
            console.log(`ETH PRICE IN USD: ${ethPrice.data.USD}`);
            console.log(`USD RAISED SO FAR: ${weiRaisedInEth * ethPrice.data.USD}`);

            var walletBalance = await web3.eth.getBalance(wallet);
            var investorBalance = await web3.eth.getBalance(investor);
            console.log(`WALLET ETH BALANCE: ${walletBalance.valueOf()}`);
            console.log(`INVESTOR ETH BALANCE: ${investorBalance.valueOf()}`);

            crowdsaleTokensBalance = await this.token.balanceOf(this.crowdsale.address);
            investorTokenBalance = await this.token.balanceOf(investor);
            console.log(`INVESTOR TOKEN BALANCE: ${investorTokenBalance.valueOf()}`);
            console.log(`CROWDSALE TOKEN BALANCE: ${crowdsaleTokensBalance.valueOf()}`);
        });
    });
});



