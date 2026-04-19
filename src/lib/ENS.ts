import Web3 from "web3";
import names from './names';

export class ENS {
	constructor(private web3: Web3) {
		///
	}

	async reverseLookup(addr: string) {
		return names[addr];

        // const reverseNode = addr.toLowerCase().substring(2) + '.addr.reverse';
        // const resolver = await this.web3.eth.ens.getResolver(reverseNode);
        // return await resolver.methods.name(namehash(reverseNode)).call();
	}
}
