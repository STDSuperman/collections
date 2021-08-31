import { existsSync, mkdirSync } from 'fs';
import { join as pathJoin } from 'path';

export function mkdirpSync(
	path: string,
	mode?: string | number,
	cb?: () => void
):void {
	const arr = path.split('/').filter(i => i);

	if (arr[0] === './') {
		arr.shift();
	}
	if (arr[0] === '../') {
		arr.splice(0, 2, arr[0] + '/' + arr[1]);
	}
	const inner = (curPath = '') => {
		if (!existsSync(curPath)) {
			mkdirSync(curPath, {
				mode
			});
		}

		if (arr.length) {
			inner(pathJoin(curPath, arr.shift() || ''));
		} else {
			cb && cb();
		}
	}
	arr.length && inner(arr.shift());
}