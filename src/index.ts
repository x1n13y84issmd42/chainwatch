import './assets';

import { Engine, Context, register } from '@x1n13y84issmd42/react-at-home';
import { register as register2} from './comp';

(async () => {
	const ui = new Engine();

	register(ui);
	register2(ui);

	const ctx = new Context({
		n: 7,
		ns: [1, 2, 3],
		user: {
			name: 'Johnny Doe',
			id: 4001,
			email: 'user@user.com',
		},
		numbers: [1, 2, 3, 44, 5, 666, 777, 8, 9],
		users: [
			{
				id: 4001,
				name: 'Johnny Doe',
				email: 'user@user.com',
				color: 'red',
				position: 'Placeholder',
				company: 'Everywhere',
			},
			{
				id: 222,
				name: 'Luise Rider',
				email: 'lu@area.com',
				color: 'orange',
				position: 'Hot mom',
				company: 'Your area',
			},
			{
				id: 222001,
				name: 'Adolf Schickelburger',
				email: '88@reich.com',
				color: 'gray',
				position: 'Fuhrer',
				company: '3rd Reich',
			},
			{
				id: 404,
				name: 'Naught Foundovich',
				email: 'no@404.com',
				color: 'green',
				position: '--',
				company: '****',
			},
		],
		selectedUser: 0,
		ethereum: (window as any).ethereum
    });

	ctx.mergeState({
		alert: (v: string) => {
			alert(`${ctx.state.user.name} says: "${v}"`);
		}
	});

	await ui.render((window as any).test, ctx);
})().catch(console.error);