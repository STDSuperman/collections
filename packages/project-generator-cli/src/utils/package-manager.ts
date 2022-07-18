import { existsSync } from 'fs';
import { resolve as pathResolve } from 'path';
import { sync } from 'execa';

export type IPackageManagerMap = 'npm' | 'yarn' | 'pnpm';
export type IPkgManagerLockFileMap = 'pnpm-lock.yaml' | 'yarn.lock' | 'package-lock.json';

const checkGlobalPkgManagerVersion = (key: IPackageManagerMap): boolean => {
  try {
    return !!sync(key, ['--version']);
  } catch {
    return false;
  }
};

const checkLocalPkgManagerExists = (lockFile: IPkgManagerLockFileMap): boolean => {
  return existsSync(pathResolve(process.cwd(), lockFile));
};

export const getPackageManager = (): IPackageManagerMap | null => {
  const pkgManagerLockFileMap: Record<
		IPackageManagerMap,
		IPkgManagerLockFileMap
	> = {
	  pnpm: 'pnpm-lock.yaml',
	  yarn: 'yarn.lock',
	  npm: 'package-lock.json',
	};
  for (const key in pkgManagerLockFileMap) {
    const pkgManagerKey = key as IPackageManagerMap;
    if (Object.prototype.hasOwnProperty.call(
      pkgManagerLockFileMap, pkgManagerKey,
    )) {
      const lockFile = pkgManagerLockFileMap[pkgManagerKey];
      if (checkLocalPkgManagerExists(lockFile)) {
        return pkgManagerKey;
      } else if (checkGlobalPkgManagerVersion(pkgManagerKey)) {
        return pkgManagerKey;
      }
    }
  }
  process.exit(2);
};

export const getPkgExecCommand = (): string => {
  const pkgManager = getPackageManager();
  return `${pkgManager === 'npm' ? 'run' : ''}`;
};

export const getExecCommand = (): string | null => {
  const pkgManager = getPackageManager();
  return pkgManager === 'npm' ? 'npm run' : pkgManager;
};

export const getInstallCommand = (): string | null => {
  const pkgManager = getPackageManager();
  return pkgManager?.includes('npm') ? `${pkgManager} install` : pkgManager;
};