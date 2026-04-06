type State = Partial<{
	on_addr_click: Function;
	onclick: Function;
}>;

export async function stateFn(state: State) {
	state.onclick = function (addr: string) {
		return function() {
			state.on_addr_click && state.on_addr_click(addr);
		}
	};

	return state;
}
