import { ArraySortedDesc } from '@x1n13y84issmd42/n/dist/collections/SortedArray'
import { AddressNode } from "./types";

/**
 * A sorted set of top N addresses by total number of transactions.
 */
export class TopAddrs extends ArraySortedDesc<AddressNode> {
	constructor(limit: number) {
		super(limit, (a, b) => (a.txFrom.length + a.txTo.length) < (b.txFrom.length + b.txTo.length));
	}

	push(v: AddressNode): number {
		// The same address can be added multiple times as it updates with new txs.
		// So deleting the older outdated dublicate first.
		const i = this.findIndex(a => a.a === v.a);
		if (i >= 0) {
			this.splice(i, 1);
		}

		return super.push(v);
	}
}
