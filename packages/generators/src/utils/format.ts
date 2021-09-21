import prettier from 'prettier';
import type { Options } from 'prettier';

export function sortCode(
	code: string,
	formatOpts?: Options
) {
	return prettier.format(code, {
		...formatOpts
	});
}