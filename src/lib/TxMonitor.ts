import Web3, { Transaction } from "web3";

export type TxHandler = (tx: Transaction)=>Promise<void>;

export class TxMonitor {
	handlers: {
		tx: TxHandler[];
	} = {
		tx: [],
	};

	constructor(protected web3: Web3) {
		///
	}

	on(w: keyof typeof this.handlers, handler: TxHandler) {
		this.handlers[w].push(handler);
	}

	async monitor() {
		const sub = await this.web3.eth.subscribe('newBlockHeaders');
		sub.on('data', async blockHeader => {
			
			const block = await this.web3.eth.getBlock(blockHeader.hash);
			
			for (let txHash of block.transactions) {

				if (typeof txHash == 'string') {
					const tx = await this.web3.eth.getTransaction(txHash);
					// console.log('tx');
					// console.dir(tx);

					this.handleTx(tx);
				}
			}
		});
	}

	protected handleTx(tx: Transaction) {
		for (let h of this.handlers['tx']) {
			setImmediate(() => h(tx).catch(console.error));
		}
	}
}