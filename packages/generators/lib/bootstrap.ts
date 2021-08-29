import { SuperCli } from './super-cli';
import consola from 'consola';

export async function runCLI(
	args: string[]
) {
	try {
		const cli = new SuperCli();
		await cli.run(args);
	} catch (err) {
		console.error(err);
		process.exit(err.code || err.message);
	}
}