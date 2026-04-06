import Web3, { BlockHeaderOutput, Transaction } from "web3";
import { NewHeadsSubscription } from "web3-eth";

export type BlockHandler = (b: BlockHeaderOutput)=>Promise<void>;
export type TxHandler = (tx: Transaction)=>Promise<void>;

export class TxMonitor {
	handlers: {
		block: BlockHandler[];
		tx: TxHandler[];
	} = {
		block: [],
		tx: [],
	};

	blockSub!: NewHeadsSubscription;

	constructor(protected web3: Web3) {
		///
	}

	on(w: keyof typeof this.handlers, handler: TxHandler|BlockHandler) {
		this.handlers[w].push(handler as any);
	}

	async monitor() {
		this.blockSub = await this.web3.eth.subscribe('newBlockHeaders');
		this.blockSub.on('data', async blockHeader => {
			await this.handle('block', blockHeader);
			
			const block = await this.web3.eth.getBlock(blockHeader.hash);
			
			for (let txHash of block.transactions) {

				if (typeof txHash == 'string') {
					const tx = await this.web3.eth.getTransaction(txHash);
					await this.handle('tx', tx);
				}
			}
		});
	}

	async stop() {
		console.log(`Stop monitor`);
		this.blockSub && await this.blockSub.unsubscribe();
	}

	protected async handle(w: keyof typeof this.handlers, tx: unknown) {
		try {
			await Promise.all(this.handlers[w].map(h => h(tx as any)));
		} catch (e: unknown) {
			console.error(e);
		}
	}
}