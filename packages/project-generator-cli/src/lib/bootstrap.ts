import { SuperCli } from './cli';
import consola from 'consola';

export async function runCLI(
  args: string[],
) {
  try {
    const cli = new SuperCli();
    await cli.run(args);
  } catch (err: any) {
    consola.error(err);
    process.exit(err.code || err.message);
  }
}