import { Transaction, Web3 } from 'web3';
import { D3Graph } from '../lib/D3Graph';
import { Context } from '@x1n13y84issmd42/react-at-home';
import { TxMonitor } from '../lib/TxMonitor';

export type State = Partial<{
	ethereum: any;

	addnode: Function;
	onaddrsubmit: Function;
	monitor: Function;

	width: number;
	height: number;
	
	dg: D3Graph;
	web3: Web3;
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
			state.dg?.addAddress(a, 11);
		}
	
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
				state.dg?.addAddress(addr, +web3.utils.fromWei(v, 'ether'));

				const mon = new TxMonitor(web3);
				mon.on('tx', async (tx: Transaction) => {
					if (tx.value && tx.from && tx.to) {
						counters[tx.from] = (counters[tx.from] || 0) + 1;
						counters[tx.to] = (counters[tx.to] || 0) + 1;

						if (state.dg?.hasAddress(tx.from) || state.dg?.hasAddress(tx.to)) {
							const fromBalance = +web3.utils.fromWei(await web3.eth.getBalance(tx.from), 'ether');
							const toBalance = +web3.utils.fromWei(await web3.eth.getBalance(tx.to), 'ether');

							const fromIndex = state.dg?.addAddress(tx.from, fromBalance);
							const toIndex = state.dg?.addAddress(tx.to, toBalance);

							state.dg?.addTx(fromIndex, toIndex, +web3.utils.fromWei(tx.value!, 'ether'))
						}
					}
				});
				mon.monitor().catch(console.error);
			});
		}

		// Monitor transactions.
		state.monitor = function() {
			const mon = new TxMonitor(web3);
			mon.on('tx', async (tx: Transaction) => {
				if (tx.value && tx.from && tx.to) {
					const fromBalance = +web3.utils.fromWei(await web3.eth.getBalance(tx.from), 'ether');
					const toBalance = +web3.utils.fromWei(await web3.eth.getBalance(tx.to), 'ether');

					// Skipping too small txs to unclutter the screen
					const tooSmallTx = 0.5;
					if (fromBalance < tooSmallTx && toBalance < tooSmallTx) {
						return;
					}

					const fromIndex = state.dg?.addAddress(tx.from!, fromBalance);
					const toIndex = state.dg?.addAddress(tx.to!, toBalance);

					state.dg?.addTx(fromIndex!, toIndex!, +web3.utils.fromWei(tx.value!, 'ether'))
				}
			});
			mon.monitor().catch(console.error);
		}
	} else {
		console.log(`NO ETH`);
	}

	return {};
}

export async function onRender(ctx: Context<State>) {
	ctx.state.dg = new D3Graph('#graph');
}
