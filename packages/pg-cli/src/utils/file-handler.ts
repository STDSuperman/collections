import { existsSync, mkdirSync } from 'fs';
import { join as pathJoin } from 'path';
import jsonfile from 'jsonfile';
import { merge as ldMerge } from 'lodash';

export enum ReadType {
	PATH = 'path',
	CONTENT = 'content'
}

export type IPkgInfo = {
	type: ReadType;
	content: string;
}

export type IPkgInputType = string | IPkgInfo;

export function mkdirpSync(
	path: string,
	mode?: string | number,
	cb?: () => void
): void {
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

export const mergePkg = (packageFilePathArr: IPkgInputType[]) => {
	const result = {};
	packageFilePathArr.forEach((item: IPkgInputType) => {
		let json = {};
		if (
			typeof item === 'string'
			|| item.type === ReadType.PATH
		) {
			json = jsonfile.readFileSync(
				typeof item === 'string'
					? item
					: item.content
				);
		} else if (item.type === ReadType.CONTENT) {
			json = JSON.parse(item.content);
		}
		return ldMerge(result, json);
	});
	return result;
}