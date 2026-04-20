import Web3 from "web3";
import { ENS } from "./ENS";
import { EventHost } from "./EventHost";

type TxEdge = {
	hash: string;
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
	as: string; // Shortened address
	name?: string;
	balance: number;

	type: AddressType;

	pathsFrom: number;
	pathsTo: number;

	amountSent: number;
	amountReceived: number;
};

type AddressMap = Map<string, AddressNode>;
type AddrEvent = {addr: AddressNode};
type AddrTxEvent = {addr: AddressNode, tx: TxEdge};

type TxGraphEventTypes = {
	AddrChainData: AddrEvent,
	IncomingTx: AddrTxEvent,
	OutgoingTx: AddrTxEvent,
};

export class TxGraph extends EventHost<TxGraphEventTypes> {
	addressBook: AddressMap = new Map();
	ENS: ENS;

	constructor(private web3: Web3) {
		super();
		this.ENS = new ENS(web3);
	}

	addTx(fromAddr: string, toAddr: string, amount: number, hash?: string) {
		const from = this.getAddress(fromAddr);
		const to = this.getAddress(toAddr);

		const tx: TxEdge = {
			from,
			to,
			amount,
			hash: hash || '',
		};

		this.addFromTx(from, tx);
		this.addToTx(to, tx);
	}

	private addFromTx(addr: AddressNode, tx: TxEdge) {
		addr.txFrom.push(tx);
		addr.amountSent += tx.amount;
		this.dispatch('OutgoingTx', {addr, tx});
	}
	
	private addToTx(addr: AddressNode, tx: TxEdge) {
		addr.txTo.push(tx);
		addr.amountReceived += tx.amount;
		this.dispatch('IncomingTx', {addr, tx});
	}

	getAddress(addr: string): AddressNode {
		if (! this.addressBook.has(addr)) {
			this.addressBook.set(addr, {
				a: addr,
				name: addr,//ENS[addr],
				as: `${addr.substring(0, 6)}...${addr.substring(addr.length-4)}`,
				balance: 0,
				type: AddressType.WALLET,
				pathsFrom: 0,
				pathsTo: 0,
				amountSent: 0,
				amountReceived: 0,
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
				a.name = await this.ENS.reverseLookup(addr);
				
				const code = await this.web3.eth.getCode(addr);
				if (code !== '0x') {
					a.type = AddressType.CONTRACT;

					if (code.substring(0, 8) === '0xef0100') {
						a.name = 'EIP-7702 Delegate';
					}
				}
	
				this.addressBook.set(addr, a);
				this.dispatch('AddrChainData', {addr: a});
			} catch (e: unknown) {
				console.error(e);
			}
		});
	}

	traverseTx(addr: AddressNode, h: (tx:TxEdge)=>void, txLimit: number) {
		function dfs(tx: TxEdge, seen: Set<string>) {
			if (seen.size >= txLimit) return;
			if (seen.has(tx.hash)) return;
			h(tx);
			seen.add(tx.hash);
			tx.from.txTo.forEach(e => dfs(e, seen));
			tx.from.txFrom.forEach(e => dfs(e, seen));
			tx.to.txTo.forEach(e => dfs(e, seen));
			tx.to.txFrom.forEach(e => dfs(e, seen));
		}
		
		const s: Set<string> = new Set();
		addr.txTo.forEach(e => dfs(e, s));
		addr.txFrom.forEach(e => dfs(e, s));
	}
}

