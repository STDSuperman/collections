import { SuperCli } from './super-cli';

export default async function runCLI(
	args: string[]
) {
	try {
		const cli = new SuperCli();
		await cli.run(args);
	} catch (err) {
		process.exit(err.code || err.message);
	}
}