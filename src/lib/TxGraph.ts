import Web3 from "web3";

type TxEdge = {
	amount: number;
	from: AddressNode;
	to: AddressNode;
};

export enum AddressType {
	WALLET,
	CONTRACT,
};

export type TxEdges = {
	txFrom: TxEdge[];
	txTo: TxEdge[];
}

export type AddressNode = TxEdges & {
	a: string;
	name: string;
	balance: number;

	type: AddressType;

	pathsFrom: number;
	pathsTo: number;

	numChainPaths: number;
	avgCnainPathLength: number;
	maxCnainPathLength: number;
};

type AddressMap = Map<string, AddressNode>;

type AddressNodeHandler = (a: AddressNode, p?: AddressNode) => void;

type AddrChainDataHandler = (a: AddressNode)=>void;

export class TxGraph {
	addressBook: AddressMap = new Map();

	constructor(private web3: Web3) {
		///
	}

	addTx(fromAddr: string, toAddr: string, amount: number) {
		const from = this.getAddress(fromAddr);
		const to = this.getAddress(toAddr);

		const tx: TxEdge = {
			from,
			to,
			amount,
		};

		this.addFromTx(from, tx);
		this.addToTx(to, tx);
	}

	private addFromTx(addr: AddressNode, tx: TxEdge) {
		addr.txFrom.push(tx);
		addr.pathsFrom++;

		const pathFromMod = tx.to.pathsFrom ? tx.to.pathsFrom - 1 : 0;

		if (addr.pathsFrom > 1) {
			this.traversePathIn(addr, (node) => {
				node.pathsFrom += pathFromMod;
				node.numChainPaths = (node.pathsTo||1) * (node.pathsFrom||1);
			});
		}
	}
	
	private addToTx(addr: AddressNode, tx: TxEdge) {
		addr.txTo.push(tx);
		addr.pathsTo++;
	
		const pathToMod = tx.from.pathsTo ? tx.from.pathsTo - 1 : 0;

		if (addr.pathsTo > 1) {
			this.traversePathOut(addr, (node) => {
				node.pathsTo += pathToMod;
				node.numChainPaths = (node.pathsFrom||1) * (node.pathsTo||1);
			});
		}
	}

	getAddress(addr: string): AddressNode {
		if (! this.addressBook.has(addr)) {
			this.addressBook.set(addr, {
				a: addr,
				name: `${addr.substring(0, 6)}...${addr.substring(addr.length-4)}`,
				balance: 0,
				type: AddressType.WALLET,
				pathsFrom: 0,
				pathsTo: 0,
				numChainPaths: 0,
				avgCnainPathLength: 0,
				maxCnainPathLength: 0,
				txFrom: [],
				txTo: [],
			});

			this.updateAddrChainData(addr);
		}

		return this.addressBook.get(addr)!;
	}

	private updateAddrChainData(addr: string) {
		setImmediate(async () => {
			try {
				//TODO: potential race condition here?
				// The address object can be changed between getting and setting
				// during await by another async op?
				const a = this.addressBook.get(addr)!;
	
				const b = await this.web3.eth.getBalance(addr);
				a.balance = +this.web3.utils.fromWei(b, 'ether');
	
				const code = await this.web3.eth.getCode(addr);
				if (code !== '0x') {
					a.type = AddressType.CONTRACT;
				}
	
				this.addressBook.set(addr, a);
				this.handleAddrChainData(a);
			} catch (e: unknown) {
				console.error(e);
			}
		});
	}

	traversePathOut(addr: AddressNode, h: AddressNodeHandler) {
		function dfs(parentNode: AddressNode | undefined, node: AddressNode, seen: Set<AddressNode>) {
			if (seen.has(node)) return;
			h(node, parentNode);
			seen.add(node);
			node.txFrom.forEach(e => dfs(node, e.to, seen));
		}

		dfs(undefined, addr, new Set());
	}

	traversePathIn(addr: AddressNode, h: AddressNodeHandler) {
		function dfs(parentNode: AddressNode | undefined, node: AddressNode, seen: Set<AddressNode>) {
			if (seen.has(node)) return;
			h(node, parentNode);
			seen.add(node);
			node.txTo.forEach(e => dfs(node, e.from, seen));
		}

		dfs(undefined, addr, new Set());
	}

	private onAddrChainDataHandlers: AddrChainDataHandler[] = [];

	onAddrChainData(h: AddrChainDataHandler) {
		this.onAddrChainDataHandlers.push(h);
	}

	handleAddrChainData(addr: AddressNode) {
		this.onAddrChainDataHandlers.forEach(h => h(addr));
	}
}
