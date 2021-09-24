import { 
	readFileSync,
	writeFileSync,
	readdirSync
} from 'fs';
import { existsSync } from 'fs-extra'
import { resolve as pathResolve } from 'path';
import { compile as ejsCompile } from 'ejs';
import { IGeneratorOptions } from './generator';
import consola from 'consola';
import mergePkg, { ReadType } from './plugins/package-json-merge'
import { formatCode } from '../utils/index'
export class TemplateFileGenerator {
	private defaultFileList: Array<string> = [];
	private tsConfigFileList: Array<string> = [];
	private isTsTemplate = false;
	private outputPath = '';
	private filterFileList = ['.DS_Store']
	private defaultFileDir = '';
	private tsRelateFileDir = '';
	private templateEnginExtLength = 4
	constructor(
		public runtimeOpts: IGeneratorOptions
	) {
		this.setFileListDir();
		this.isTsTemplate = runtimeOpts.opts.template === 'ts';
	}
	start(outputPath: string) {
		this.outputPath = outputPath;
		this.compileFileList(this.defaultFileList, this.defaultFileDir);
		if (this.isTsTemplate) {
			this.compileFileList(this.tsConfigFileList, this.tsRelateFileDir);
		}
	}
	setFileListDir() {
		const templateFileDir = pathResolve(
			__dirname,
			'../templates/creator-init-template'
		);
		this.defaultFileDir = pathResolve(templateFileDir, 'default');
		this.defaultFileList = this.filterFile(
			readdirSync(this.defaultFileDir)
		)
		this.tsRelateFileDir = pathResolve(templateFileDir, 'ts');
		this.tsConfigFileList = this.filterFile(
			readdirSync(this.tsRelateFileDir)
		)
	}
	filterFile(targetFileList: string[]) {
		return targetFileList.filter(filename => !this.filterFileList.includes(filename))
	}
	compileFileList(fileList: string[], dir: string) {
		fileList.forEach(
			filename => {
				const fullTemplateFilePath = pathResolve(dir, filename)
				const resultFilename = this.removeTemplateEngineExt(filename);
				const currentFileOutputPath = pathResolve(
					this.outputPath,
					resultFilename
				);
				const templateFileContent = readFileSync(
					fullTemplateFilePath,
					'utf8'
				);
				const compiledFileContent = ejsCompile(templateFileContent)({
						projectName: this.runtimeOpts.projectName,
						isTsTemplate: this.isTsTemplate
					})
				if (existsSync(currentFileOutputPath)) {
					this.handleFileExist(
						resultFilename,
						currentFileOutputPath,
						compiledFileContent
					)
					return;
				}
				writeFileSync(currentFileOutputPath, compiledFileContent);
			}
		)
	}

	handleFileExist(
		filename: string,
		currentFileOutputPath: string,
		compiledFileContent: string
	) {
		if (
			existsSync(currentFileOutputPath)
			&& !this.runtimeOpts.opts.overwrite
			&& filename !== 'package.json'
		) {
			consola.info(`file exists: ${filename}`)
			return;
		} else if (existsSync(currentFileOutputPath)) {
			// 处理合并package.json文件
			const fileContent = mergePkg(
				[currentFileOutputPath, {
					type: ReadType.CONTENT,
					content: compiledFileContent
				}]
			);
			writeFileSync(currentFileOutputPath, formatCode(
					JSON.stringify(fileContent),
					{
						parser: 'json'
					}
				)
			);
			return;
		}
	}
 	removeTemplateEngineExt(filename: string) {
		return filename.slice(0, -this.templateEnginExtLength);
	}
}