
import { IGenerateCommandOptions } from './types'
import { 
	writeFileSync,
	existsSync,
} from 'fs';
import {
	command as execCommandAsync,
} from 'execa'
import type { Options } from 'execa'
import { resolve as pathResolve, join as pathJoin } from 'path';
import { mkdirpSync } from 'fs-extra';
import consola from 'consola';
import { getExecCommand, getInstallCommand } from '../utils';
import { TemplateFileGenerator } from './template-file-generator';
export interface IGeneratorOptions {
	projectName: string;
	opts: IGenerateCommandOptions;
}

export interface IWriteFileInfo {
	filename: string;
	value: string;
}

export type ICommandOption = string | {
	command: string;
	options?: Options<string>;
}

export class ProjectGenerator {
	private projectName: string;
	private opts: IGenerateCommandOptions
	private outputDirPath = '';
	private cwd: string;
	constructor(
		public runtimeOptions: IGeneratorOptions
	) {
		this.projectName = runtimeOptions.projectName;
		this.opts = runtimeOptions.opts;
		this.cwd = process.cwd();
	}

	run(args: string[]) {
		if (this.runtimeOptions.opts.onlyConfig) {
			this.outputDirPath = pathResolve(this.cwd);
			this.handleOnlyInitConfig();
			return;
		}
		this.outputDirPath = pathResolve(this.cwd, this.projectName);
		this.checkProjectNameExist();
		this.makeInitDirAndFile();
		this.initConfigFile();
	}

	initConfigFile() {
		const tfg = new TemplateFileGenerator(this.runtimeOptions);
		tfg.start(pathResolve(
			process.cwd(),
			this.runtimeOptions.projectName
		));
		this.runInitCommand();
	}

	handleOnlyInitConfig() {
		const tfg = new TemplateFileGenerator(this.runtimeOptions);
		tfg.start(pathResolve(process.cwd()));
		this.runInitCommand();
	}

	checkProjectNameExist() {
		if (existsSync(this.outputDirPath)) {
			if (this.opts.overwrite) return;
			consola.error('project name is already exists')
			process.exit(1)
		} else {
			mkdirpSync(this.outputDirPath);
		}
	}

	makeInitDirAndFile() {
		mkdirpSync(pathResolve(this.outputDirPath, 'src'));
		writeFileSync(
			pathResolve(
				this.outputDirPath,
				'src',
				'index.' + this.opts.template
			),
			''
		);
	}

	async runInitCommand() {
		const execCommand = getExecCommand();
		try {
			const commandList = [
				`${getInstallCommand()}`,
				`${execCommand} husky-pre-commit`,
				`${execCommand} husky-commit-msg`
			]
			if (!this.hasGitEnvironment()) {
				commandList.unshift(`git init`)
			}
			await this.batchExecCommandsSyncWithoutOptions(
				commandList,
				{
					cwd: this.outputDirPath
				}
			)
		} catch (err) {
			consola.error(err);
		}
	}

	hasGitEnvironment() {
		return existsSync(pathResolve(this.outputDirPath, '.git'))
	}

	async batchExecCommandsSyncWithoutOptions(
		commandList: ICommandOption[],
		commonOptions?: Options
	) {
		let curIdx = 0;
		while (curIdx < commandList.length) {
			const commandInfo = commandList[curIdx];
			const commandResult = execCommandAsync(
				typeof commandInfo === 'string' 
					? commandInfo
					: commandInfo.command,
				commonOptions
					? commonOptions
					: typeof commandInfo === 'string'
					? undefined
					: commandInfo?.options
			);
			commandResult.stdout?.pipe(process.stdout);
			await commandResult;
			curIdx++;
		}
	}
}