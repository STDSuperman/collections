
import {
	IGenerateCommandOptions
} from './types'
import ejs from 'ejs';
import {
	readFileSync,
	writeFileSync
} from 'fs';
import {
	resolve as pathResolve,
	join as pathJoin
} from 'path';
import { mkdirpSync } from '../utils'

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
	constructor(options: ITsGeneratorOptions) {
		this.projectName = options.projectName;
		this.opts = options.opts;
		this.templateFileList = this.getTemplateFileList();
		this.templateDirPath = pathResolve(
			__dirname,
			'../templates/generator-init-template'
		);
		const cwd = process.cwd();
		this.outputDirPath = cwd;
	}

	run() {
		this.templateFileList.forEach(filename => {
			const fullFilePath = this.getTemplateFilePath(filename)
			const templateFileContent = readFileSync(
				fullFilePath,
				'utf8'
			);
			const compiledFileContent = ejs.compile(templateFileContent)({
				projectName: this.projectName
			})
			this.writeFileTree({
				filename,
				value: compiledFileContent
			});
		})
	}

	getTemplateFilePath(filePath: string) {
		return pathJoin(this.templateDirPath, filePath);
	}

	getTemplateFileList() {
		return [
			'package.json.ejs'
		]
	}

	getOutputFilePath(filename: string) {
		return pathJoin(this.outputDirPath, filename)
	}
	
	writeFileTree(fileInfo: IWriteFileInfo) {
		const outputFilePath = this.getOutputFilePath(fileInfo.filename);
		mkdirpSync(outputFilePath);
		writeFileSync(fileInfo.filename, fileInfo.value);
	}
}