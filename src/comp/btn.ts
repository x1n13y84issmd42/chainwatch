export interface State {
	value: string;
}

export async function stateFn(state: State) {
	return {
		value: state.value || ''
	};
}
