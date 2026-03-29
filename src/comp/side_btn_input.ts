export type State = Partial<{
	onkeypress: Function;
	onclick: Function;
	onsubmit: Function;
}>;

export async function stateFn(state: State) {
	state.onkeypress = function(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			const v = (e.target as HTMLInputElement).value;

			if (!v) {
				return;
			}

			if (state.onsubmit) {
				state.onsubmit(v);
				(e.target as HTMLInputElement).value = '';
			}
		}
	}
	
	state.onclick = function(e: MouseEvent) {
		const p = (e.target as Element).parentElement;
		const input = p?.querySelector('input[type=text]') as HTMLInputElement;
		const v = input.value;

		if (!v) {
			return;
		}

		if (state.onsubmit) {
			state.onsubmit(v);
			input.value = '';
		}
	}

	return state;
}