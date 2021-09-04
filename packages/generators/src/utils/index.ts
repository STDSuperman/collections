import { existsSync, mkdirSync } from 'fs';
import { join as pathJoin, resolve as pathResolve } from 'path';
import { sync } from 'execa'

export type IPackageManagerMap = 'npm' | 'yarn' | 'pnpm'
export type IPkgManagerLockFileMap =  'pnpm-lock.yaml' | 'yarn.lock' | 'package-lock.json'

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

const checkGlobalPkgManagerVersion = (key: IPackageManagerMap): boolean => {
	try {
		return !!sync(key, ['--version'])
	} catch {
		return false;
	}
}

const checkLocalPkgManagerExists = (lockFile: IPkgManagerLockFileMap): boolean => {
	return existsSync(pathResolve(process.cwd(), lockFile));
}

export const getPackageManager = (): IPackageManagerMap | null => {
	const pkgManagerLockFileMap: Record<
		IPackageManagerMap,
		IPkgManagerLockFileMap
	> = {
		'pnpm': 'pnpm-lock.yaml',
		'yarn': 'yarn.lock',
		'npm': 'package-lock.json'
	};
	for (const key in pkgManagerLockFileMap) {
		const pkgManagerKey = key as IPackageManagerMap;
		if (Object.prototype.hasOwnProperty.call(pkgManagerLockFileMap, key)) {
			const lockFile = pkgManagerLockFileMap[key as IPackageManagerMap];
			if (checkLocalPkgManagerExists(lockFile)) {
				return key as IPackageManagerMap;
			} else if (checkGlobalPkgManagerVersion(pkgManagerKey)) {
				return pkgManagerKey;
			};
		}
	}
	process.exit(2);
}

export const getPkgExecCommand = (): string => {
	const pkgManager = getPackageManager();
	return `${pkgManager === 'npm' ? 'run' : ''}`
}

export const getExecCommand = (): string | null => {
	const pkgManager = getPackageManager();
	return pkgManager === 'npm' ? 'npm run' : pkgManager;
};

export const getInstallCommand = (): string | null => {
	const pkgManager = getPackageManager();
	return pkgManager === 'npm' ? 'npm install' : pkgManager;
};