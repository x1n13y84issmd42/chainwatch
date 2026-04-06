type State = Partial<{
	addrclick: Function;
	onclick: Function;
}>;

export async function stateFn(state: State) {
	state.onclick = function (addr: string) {
		return function() {
			console.log('addr list onclick', addr, state);
			state.addrclick && state.addrclick(addr);
		}
	};

	return state;
}
