import { existsSync, mkdirSync } from 'fs';
import { join as pathJoin } from 'path';

export function mkdirpSync(
	path: string,
	mode?: string | number,
	cb?: () => void
):void {
	const arr = path.split('/');

	if (arr[0] === './') {
		arr.shift();
	}
	if (arr[0] === '../') {
		arr.splice(0, 2, arr[0] + '/' + arr[1]);
	}

	function inner(curPath: string = '') {
		if (!existsSync(curPath)) {
			mkdirSync(curPath, mode || 0o755);
		}

		if (arr.length) {
			inner(pathJoin(curPath, arr.shift() || ''));
		} else {
			cb && cb();
		}
	}
	arr.length && inner(arr.shift());
}