
import { IGenerateCommandOptions } from './types'
import { 
	readFileSync,
	writeFileSync,
	existsSync,
	readdirSync
} from 'fs';
import {
	command as execCommandAsync,
} from 'execa'
import type { Options } from 'execa'
import { resolve as pathResolve, join as pathJoin } from 'path';
import { compile as ejsCompile } from 'ejs';
import { mkdirpSync } from 'fs-extra';
import consola from 'consola';
import { getExecCommand, getInstallCommand } from '../utils';
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
	options?: Options<string>;
}

export class ProjectGenerator {
	private projectName: string;
	private opts: IGenerateCommandOptions
	private templateFileList: string[] = [];
	private genInitTemplateDirPath: string;
	private outputDirPath: string;
	private templateEngineExt = '.ejs'
	private ignoreTemplateFile = ['.DS_Store']
	private isTsTemplate = false;
	constructor(options: ITsGeneratorOptions) {
		this.projectName = options.projectName;
		this.opts = options.opts;
		this.genInitTemplateDirPath = pathResolve(
			__dirname,
			'../templates/generator-init-template'
		);
		const cwd = process.cwd();
		this.outputDirPath = pathResolve(cwd, this.projectName);
		this.isTsTemplate = this.opts.template === 'ts';
	}

	run(args: string[]) {
		this.checkProjectNameExist();
		this.initTemplateConfig();
		this.writeInitFile();
		this.runInitCommand();
		this.makeInitDirAndFile();
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

	initTemplateConfig() {
		if (!this.isTsTemplate) {
			// ignore ts-config
			this.ignoreTemplateFile.push('tsconfig.json.ejs');
		}
		this.templateFileList = this.getTemplateFileList();
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
						projectName: this.projectName,
						isTsTemplate: this.isTsTemplate
					})
				this.writeFileTree({
					filename,
					value: compiledFileContent
				});
			}
		)
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
			await this.batchExecCommandsSyncWithoutOptions([
				`git init`,
				`${getInstallCommand()}`,
				`${execCommand} husky-pre-commit`,
				`${execCommand} husky-commit-msg`
			], {
				cwd: this.outputDirPath
			})
		} catch (err) {
			consola.error(err);
		}
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