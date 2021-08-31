
import { IGenerateCommandOptions } from './types'
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve as pathResolve, join as pathJoin } from 'path';
import ejs from 'ejs';
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

export class tsGenerator {
	private projectName: string;
	private opts: IGenerateCommandOptions
	private templateFileList: string[] = [];
	private templateDirPath: string;
	private outputDirPath: string;
	private templateEngineExt = '.ejs'
	constructor(options: ITsGeneratorOptions) {
		this.projectName = options.projectName;
		this.opts = options.opts;
		this.templateFileList = this.getTemplateFileList();
		this.templateDirPath = pathResolve(
			__dirname,
			'../templates/generator-init-template'
		);
		const cwd = process.cwd();
		this.outputDirPath = pathResolve(cwd, this.projectName);
	}

	run(args: string[]) {
		this.checkProjectNameExist();
		this.templateFileList.forEach(
			filename => {
				const fullTemplateFilePath = this.getTemplateFilePath(filename)
				const templateFileContent = readFileSync(
					fullTemplateFilePath,
					'utf8'
				);
				const compiledFileContent = ejs
					.compile(templateFileContent)({
						projectName: this.projectName
					})
				this.writeFileTree({
					filename,
					value: compiledFileContent
				});
			}
		)
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
			this.templateDirPath,
			filename + this.templateEngineExt
		);
	}

	getTemplateFileList() {
		return [
			'package.json'
		]
	}

	getOutputFilePath(filename: string) {
		return pathJoin(this.outputDirPath, filename)
	}
	
	writeFileTree(fileInfo: IWriteFileInfo) {
		const outputFilePath = this.getOutputFilePath(fileInfo.filename);
		writeFileSync(outputFilePath, fileInfo.value);
	}
}