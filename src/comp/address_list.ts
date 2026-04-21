type State = Partial<{
	addrclick: Function;
	onclick: Function;
}>;

export async function stateFn(state: State) {
	state.onclick = function (addr: string) {
		return function(this: Element) {
			this.parentElement?.querySelectorAll('.selected').forEach(e => e.classList.remove('selected'));
			this.classList.add('selected');

			state.addrclick && state.addrclick(addr);
		}
	};

	return state;
}
