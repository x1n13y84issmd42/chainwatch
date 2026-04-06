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

/*
0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
0x86e284421664840cb65c5b918da59c01ed8fa666
0x023262339a7506c54514e1ae5b9a94cda709ca74
*/

export async function stateFn(state: State) {
	if (state.web3) {
		const web3 = state.web3;

		state.addnode = function() {
			const a = `${Math.floor(Math.random() * 9999)}`;
			state.dg?.addAddress(a, 11, 0);
		}

		state.stats = {
			blockN: 0,
			txCount: 0,
			txSkippedCount: 0,
			walletAddrs: 0,
			contractAddrs: 0,
		};
		
		// - sidebar width & padding
		state.width = window.innerWidth - 100 - 20;
		state.height = window.innerHeight;
		
		// Single address monitoring.
		state.onaddrsubmit = function(addr: string) {
			const counters = {} as any;

			setInterval(() => {
				for (let a in counters) {
					if (counters[a] < 2) {
						delete counters[a];
					}
				}

				console.dir(counters);
			}, 10000);

			web3.eth.getBalance(addr).then(v => {
				state.dg?.addAddress(addr, +web3.utils.fromWei(v, 'ether'), 0);

				const mon = new TxMonitor(web3);
				mon.on('tx', async (tx: Transaction) => {
					if (tx.value && tx.from && tx.to) {
						counters[tx.from] = (counters[tx.from] || 0) + 1;
						counters[tx.to] = (counters[tx.to] || 0) + 1;

						if (state.dg?.hasAddress(tx.from) || state.dg?.hasAddress(tx.to)) {
							const fromBalance = +web3.utils.fromWei(await web3.eth.getBalance(tx.from), 'ether');
							const toBalance = +web3.utils.fromWei(await web3.eth.getBalance(tx.to), 'ether');

							const fromIndex = state.dg?.addAddress(tx.from, fromBalance, 0);
							const toIndex = state.dg?.addAddress(tx.to, toBalance, 0);

							state.dg?.addTx(fromIndex, toIndex, +web3.utils.fromWei(tx.value!, 'ether'))
						}
					}
				});
				mon.monitor().catch(console.error);
			});
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

				state.txg.traversePathOut(an, (n, p) => {
					if (p) {
						const i1 = state.dg!.addAddress(n.a, n.balance, n.type);
						const i2 = state.dg!.addAddress(p.a, p.balance, p.type);
						state.dg?.addTx(i2, i1, 0);
					}
				});

				state.txg.traversePathIn(an, (n, p) => {
					if (p) {
						const i1 = state.dg!.addAddress(n.a, n.balance, n.type);
						const i2 = state.dg!.addAddress(p.a, p.balance, p.type);
						state.dg?.addTx(i1, i2, 0);
					}
				});

				state.dg.updateSVGNodes();
			}
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

			state.top_addresses = [];

			if (state.timer) {
				clearInterval(state.timer);
			}
			
			state.timer = setInterval(() => {
				const addresses = [...state.txg!.addressBook.values().filter(a => a.numChainPaths > 1)];
				addresses.sort((a1, a2) => {
					return a2.numChainPaths - a1.numChainPaths;
				});
				addresses.splice(40);
				console.log(addresses);

				state.top_addresses = addresses;
				state.stats = state.stats;
			}, 1000);

			mon.on('block', async (b: BlockHeaderOutput) => {
				state.stats!.blockN = b.number as number;
			});

			mon.on('tx', async (tx: Transaction) => {
				if (tx.from && tx.to && tx.from !== tx.to) {
					state.txg!.addTx(tx.from, tx.to, 0n);
					state.stats!.txCount++;
				} else {
					state.stats!.txSkippedCount++;
				}

				// if (tx.value && tx.from && tx.to) {
				// 	const fromBalance = +web3.utils.fromWei(await web3.eth.getBalance(tx.from), 'ether');
				// 	const toBalance = +web3.utils.fromWei(await web3.eth.getBalance(tx.to), 'ether');

				// 	// Skipping too small txs to unclutter the screen
				// 	const tooSmallTx = 0.5;
				// 	if (fromBalance < tooSmallTx && toBalance < tooSmallTx) {
				// 		// console.log(`Skip too small.`);
				// 		return;
				// 	}

				// 	const fromIndex = state.dg?.addAddress(tx.from!, fromBalance);
				// 	const toIndex = state.dg?.addAddress(tx.to!, toBalance);

				// 	state.dg?.addTx(fromIndex!, toIndex!, +web3.utils.fromWei(tx.value!, 'ether'))
				// } else {
				// 	// console.log(`Skip.`);
				// }
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

	// const i1 = ctx.state.dg.addAddress('0x111111111111111111111111111', 100, 0);
	// const i2 = ctx.state.dg.addAddress('0x222222222222222222222222222', 200, 0);
	// const i3 = ctx.state.dg.addAddress('0x333333333333333333333333333', 2000, 0);
	// const i4 = ctx.state.dg.addAddress('0x444444444444444444444444444', 3000, 0);
	// const i5 = ctx.state.dg.addAddress('0x555555555555555555555555555', 3100, 0);

	// ctx.state.dg.addTx(i1, i2, 0);
	// ctx.state.dg.addTx(i3, i1, 0);
	// ctx.state.dg.addTx(i4, i2, 0);
	// ctx.state.dg.addTx(i5, i2, 0);
	// ctx.state.dg.updateSVGNodes();
	// ctx.state.dg.updateSim();
}
