
import { IGenerateCommandOptions } from './types'
import { 
	readFileSync,
	writeFileSync,
	existsSync,
	readdirSync
} from 'fs';
import {
	command as execCommand
} from 'execa'
import type { Options, SyncOptions } from 'execa'
import { resolve as pathResolve, join as pathJoin } from 'path';
import { compile as ejsCompile } from 'ejs';
import { mkdirpSync } from 'fs-extra'
import consola from 'consola'
export interface ITsGeneratorOptions {
	projectName: string;
	opts: IGenerateCommandOptions;
}

export interface IWriteFileInfo {
	filename: string;
	value: string;
}

export type ICommandOption = string | {
	command: string;
	options?: SyncOptions<string>;
}

export class tsGenerator {
	private projectName: string;
	private opts: IGenerateCommandOptions
	private templateFileList: string[] = [];
	private genInitTemplateDirPath: string;
	private outputDirPath: string;
	private templateEngineExt = '.ejs'
	private ignoreTemplateFile = ['.DS_Store']
	constructor(options: ITsGeneratorOptions) {
		this.projectName = options.projectName;
		this.opts = options.opts;
		this.genInitTemplateDirPath = pathResolve(
			__dirname,
			'../templates/generator-init-template'
		);
		this.templateFileList = this.getTemplateFileList();
		const cwd = process.cwd();
		this.outputDirPath = pathResolve(cwd, this.projectName);
	}

	run(args: string[]) {
		this.checkProjectNameExist();
		this.writeInitFile();
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

	getTemplateFilePath(filename: string) {
		return pathJoin(
			this.genInitTemplateDirPath,
			filename + this.templateEngineExt
		);
	}

	getTemplateFileList() {
		const fileList = readdirSync(this.genInitTemplateDirPath)
		return fileList
			.filter(filename => !this.ignoreTemplateFile.includes(filename))
			.map(filename => filename.slice(0, -4))
	}

	getOutputFilePath(filename: string) {
		return pathJoin(this.outputDirPath, filename)
	}
	
	writeFileTree(fileInfo: IWriteFileInfo) {
		const outputFilePath = this.getOutputFilePath(fileInfo.filename);
		writeFileSync(outputFilePath, fileInfo.value);
	}

	writeInitFile() {
		this.templateFileList.forEach(
			filename => {
				const fullTemplateFilePath = this.getTemplateFilePath(filename)
				const templateFileContent = readFileSync(
					fullTemplateFilePath,
					'utf8'
				);
				const compiledFileContent = ejsCompile(templateFileContent)({
						projectName: this.projectName
					})
				this.writeFileTree({
					filename,
					value: compiledFileContent
				});
			}
		)
	}

	async runInitCommand() {
		try {
			await this.batchExecCommandsWithoutOptions([
				'yarn',
				'git init',
				'pwd',
				'npx husky install',
				"npx husky set .husky/_/pre-commit 'npm run test'",
				"npx husky set .husky/_/commit-msg 'yarn commitlint --edit $1'"
			], {
				cwd: this.outputDirPath
			})
		} catch (err) {
			consola.error(err);
		}
	}

	async batchExecCommandsWithoutOptions(
		commandList: ICommandOption[],
		commonOptions?: SyncOptions<string>
	) {
		let curIdx = 0;
		while (curIdx < commandList.length) {
			const commandInfo = commandList[curIdx];
			console.log(commandInfo)
			await execCommand(
				typeof commandInfo === 'string' 
					? commandInfo
					: commandInfo.command,
				commonOptions
					? commonOptions
					: typeof commandInfo === 'string'
					? undefined
					: commandInfo?.options
			).stdout?.pipe(process.stdout)
			curIdx++;
		}
	}
}