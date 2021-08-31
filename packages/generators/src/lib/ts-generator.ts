
import { IGenerateCommandOptions } from './types'
import { 
	readFileSync,
	writeFileSync,
	existsSync,
	readdirSync
} from 'fs';
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
	private genInitTemplateDirPath: string;
	private outputDirPath: string;
	private templateEngineExt = '.ejs'
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
		this.runInstall();
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
		return fileList.map(filename => filename.slice(0, -4))
	}

	getOutputFilePath(filename: string) {
		return pathJoin(this.outputDirPath, filename)
	}
	
	writeFileTree(fileInfo: IWriteFileInfo) {
		const outputFilePath = this.getOutputFilePath(fileInfo.filename);
		writeFileSync(outputFilePath, fileInfo.value);
	}

	runInstall() {}
}