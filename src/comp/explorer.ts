import { BlockHeaderOutput, Transaction, Web3 } from 'web3';
import { D3Graph } from '../lib/D3Graph';
import { Context } from '@x1n13y84issmd42/react-at-home';
import { TxMonitor } from '../lib/TxMonitor';
import { AddressNode, AddressType, TxGraph } from '../lib/TxGraph';

export type State = Partial<{
	ethereum: any;

	addnode: Function;
	onaddrsubmit: Function;
	monitor_start: Function;
	monitor_pause: Function;

	width: number;
	height: number;
	
	dg: D3Graph;
	web3: Web3;

	top_addresses: AddressNode[];
	explore_address: Function;
	select_address: Function;
	selected_address: AddressNode;

	txg: TxGraph;
	monitor: TxMonitor;

	stats: {
		blockN: number;
		txCount: number;
		txSkippedCount: number;
		walletAddrs: number;
		contractAddrs: number;
	};

	timer: NodeJS.Timeout;
}>;

export async function stateFn(state: State) {
	if (state.web3) {
		const web3 = state.web3;

		state.stats = {
			blockN: 0,
			txCount: 0,
			txSkippedCount: 0,
			walletAddrs: 0,
			contractAddrs: 0,
		};
		
		state.select_address = function(a: string) {
			const addr = state.txg?.getAddress(a);
			state.selected_address = addr;
		}

		state.top_addresses = [
			// {a: '1', type: 0, numChainPaths: 11} as any,
			// {a: '2', type: 1, numChainPaths: 22} as any,
			// {a: '3', type: 0, numChainPaths: 33} as any,
		];

		state.explore_address = function(addr: string) {
			console.log(`Exploring address`, addr);

			if (state.txg && state.dg) {
				state.dg.clear();

				const an = state.txg.getAddress(addr);

				state.txg.traverseTx(an, (tx) => {
					const i1 = state.dg!.addAddress(tx.from.a, tx.from.name, tx.from.balance, tx.from.type);
					const i2 = state.dg!.addAddress(tx.to.a, tx.to.name, tx.to.balance, tx.to.type);
					state.dg?.addTx(i1, i2, tx.amount);
				}, 70);

				state.dg.updateSVGNodes();
			}

			state.select_address!(addr);
		}

		state.txg = new TxGraph(web3);

		state.txg.onAddrChainData(addr => {
			if (addr.type === AddressType.CONTRACT)
				state.stats!.contractAddrs++;
			else
				state.stats!.walletAddrs++;
		});

		// Monitor transactions.
		state.monitor_start = function() {
			const mon = new TxMonitor(web3);
			state.monitor = mon;

			if (state.timer) {
				clearInterval(state.timer);
			}
			
			state.timer = setInterval(() => {
				const addresses: AddressNode[] = [];
				//TODO: maintain top addresses in a heap/bin tree.
				for (let a of state.txg!.addressBook.values()) {
					if (a.numChainPaths > 1) addresses.push(a);
				}
				addresses.sort((a1, a2) => {
					return a2.numChainPaths - a1.numChainPaths;
				});
				addresses.splice(40);

				state.top_addresses = addresses;
				state.stats = state.stats;
			}, 1000);

			mon.on('block', async (b: BlockHeaderOutput) => {
				state.stats!.blockN = b.number as number;
			});

			mon.on('tx', async (tx: Transaction) => {
				if (tx.from && tx.to && tx.from !== tx.to) {
					state.txg!.addTx(tx.from, tx.to, +web3.utils.fromWei(tx.value||0n, 'ether'), (tx as any).hash);
					state.stats!.txCount++;
				} else {
					state.stats!.txSkippedCount++;
				}
			});
			mon.monitor().catch(console.error);
		}

		state.monitor_pause = function () {
			state.monitor && state.monitor.stop();
			delete state.monitor;
			state.monitor = undefined;

			if (state.timer) {
				clearInterval(state.timer)
				state.timer = undefined;
			}
		}
	} else {
		console.log(`NO ETH`);
	}

	return {};
}

export async function onRender(ctx: Context<State>) {
	ctx.state.dg = new D3Graph('#graph');
	ctx.state.dg.onNodeClick(a => {
		ctx.state.select_address!(a);
	});

	// const i1 = ctx.state.dg.addAddress('0x111111111111111111111111111', 100, 0);
	// const i2 = ctx.state.dg.addAddress('0x222222222222222222222222222', 200, 0);
	// const i3 = ctx.state.dg.addAddress('0x333333333333333333333333333', 2000, 0);
	// const i4 = ctx.state.dg.addAddress('0x444444444444444444444444444', 3000, 0);
	// const i5 = ctx.state.dg.addAddress('0x555555555555555555555555555', 3100, 0);

	// ctx.state.dg.addTx(i1, i2, 0);
	// ctx.state.dg.addTx(i3, i1, 10);
	// ctx.state.dg.addTx(i4, i2, 20);
	// ctx.state.dg.addTx(i5, i2, 0);
	// ctx.state.dg.updateSVGNodes();
	// ctx.state.dg.updateSim();
}
