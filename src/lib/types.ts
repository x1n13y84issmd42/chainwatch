export type TxEdge = {
	hash: string;
	amount: number;
	from: AddressNode;
	to: AddressNode;
};

export enum AddressType {
	WALLET,
	CONTRACT
}
;

export type TxEdges = {
	txFrom: TxEdge[];
	txTo: TxEdge[];
};

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
