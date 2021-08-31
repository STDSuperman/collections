export interface ICommandConfig {
	name: string;
	alias?: string | string[];
	noHelp?: boolean;
	hidden?: boolean;
	isDefault?: boolean;
	description?: string;
	usage?: string;
	argsDescription?: Record<string, string>;
	opts?: ICommandOption[]
}

export interface ICommandOption {
	flags: string;
	defaultValue?: any;
	description?: string;
}

export interface IGenerateCommandOptions {
	template: string;
	overwrite: boolean;
}