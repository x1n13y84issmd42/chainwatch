import { Web3 } from 'web3';

export type State = Partial<{
	authorize: Function;
	unauthorize: Function;
	account: any;
	web3: Web3;
}>;

export async function stateFn(state: State) {
	if ((window as any).ethereum) {
		const web3 = new Web3((window as any).ethereum);
		state.web3 = web3;
		
		state.account = state.account || (await web3.eth.getAccounts())[0];
	
		state.authorize = function () {
			web3.eth.requestAccounts()
				.then(accs => state.account = accs[0])
				.catch(err => console.error(err))
			;
	
			(window as any).ethereum.on('accountsChanged', (accounts: string[]) => {
				if (accounts.length === 0) {
					disconnect();
				}
			});
	
			(window as any).ethereum.on('disconnect', () => {
				disconnect();
			});
		}
	
		function disconnect() {
			state.account = false;
		}
	}

	return state;
}
