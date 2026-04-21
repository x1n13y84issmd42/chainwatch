export class EventHost<ETS extends any> {
	protected handlers: {
		[e in keyof ETS]?: Set<(ev: ETS[e]) => void>;
	} = {};

	on<ET extends keyof ETS>(en: ET, h: (ev: ETS[ET]) => void) {
		this.handlers[en] = this.handlers[en] || new Set();
		this.handlers[en].add(h);
	}

	protected dispatch<ET extends keyof ETS>(en: ET, e: ETS[ET]) {
		this.handlers[en] && this.handlers[en].forEach(h => h(e));
	}
}
