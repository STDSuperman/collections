import { 
	readFileSync,
	writeFileSync,
	readdirSync
} from 'fs';
import { resolve as pathResolve, join as pathJoin } from 'path';
import { compile as ejsCompile } from 'ejs';
import { IGeneratorOptions, IWriteFileInfo } from './pro-generator';

export class ConfigFileGenerator {
	private defaultFileList: Array<string> = [];
	private tsConfigFileList: Array<string> = [];
	private isTsTemplate = false;
	private outputDirPath: string;
	private filterFileList = ['.DS_Store']
	private defaultFileDir = '';
	private tsRelateFileDir = '';
	private templateEnginExtLength = 4
	constructor(
		public runtimeOpts: IGeneratorOptions
	) {
		this.setFileListDir();
		this.outputDirPath = pathResolve(
			process.cwd(),
			this.runtimeOpts.projectName
		);
		this.isTsTemplate = runtimeOpts.opts.template === 'ts';
	}
	start() {
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
				const templateFileContent = readFileSync(
					fullTemplateFilePath,
					'utf8'
				);
				const compiledFileContent = ejsCompile(templateFileContent)({
						projectName: this.runtimeOpts.projectName,
						isTsTemplate: this.isTsTemplate
					})
				this.writeFileTree({
					filename: this.removeTemplateEngineExt(filename),
					value: compiledFileContent
				});
			}
		)
	}
	removeTemplateEngineExt(filename: string) {
		return filename.slice(0, -this.templateEnginExtLength);
	}
	writeFileTree(fileInfo: IWriteFileInfo) {
		const outputFilePath = pathJoin(
			this.outputDirPath,
			fileInfo.filename
		);
		writeFileSync(outputFilePath, fileInfo.value);
	}
}