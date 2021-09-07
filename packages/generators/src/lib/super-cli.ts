import { program } from 'commander'
import type { Command } from 'commander'
import { tsGenerator } from './pro-generator';
import {
	ICommandConfig,
	ICommandOption,
	IGenerateCommandOptions
} from './types'

export class SuperCli {
	private program!: Command
	constructor() {
		this.program = program;
		this.program.name('super-cli')
	}

	makeCommand(
		commandOpts: ICommandConfig,
		cb: (...args: any[]) => void
	) {
		if (this.checkCommandExist(commandOpts)) return;
		const command = this.program.command(commandOpts.name, {
			noHelp: commandOpts.noHelp,
			hidden: commandOpts.hidden,
			isDefault: commandOpts.isDefault
		});

		if (commandOpts.alias) {
			if (Array.isArray(commandOpts.alias)){
				command.aliases(commandOpts.alias)
			} else {
				command.alias(commandOpts.alias)
			}
		}
		commandOpts.usage && command.usage(commandOpts.usage);
		commandOpts.description && command.description(
			commandOpts.description,
			commandOpts.argsDescription || {}
		)
		this.makeOptions(commandOpts.opts, command);
		command.action(cb)
		return command;
	}

	makeOptions(
		opts: ICommandOption[] = [],
		command: Command
	) {
		opts?.forEach(opt => {
			command.option(
				opt.flags,
				opt.description,
				opt.defaultValue
			)
		})
	}

	checkCommandExist(
		commandOpts: ICommandConfig
	) {
		return !!this.program.commands.find(command => {
			return command.name() === commandOpts.name.split(' ')[0]
			|| Array.isArray(commandOpts.alias)
			? command.aliases().find(alias => commandOpts.alias?.includes(alias))
			: command.alias() === commandOpts.alias
		})
	}

	async run(args: Array<string>) {
		const generateNewAppCommandConfig: ICommandConfig = {
			name: 'generate <project-name>',
			alias: 'g',
			description: 'Initialize a new ts/js project.',
			argsDescription: {
				'project-name': 'The name of the entire project'
			},
			usage: '',
			opts: [{
				flags: '-t, --template [type]',
				description: 'add the specified template type for project',
				defaultValue: 'ts'
			}, {
				flags: '-o, --overwrite',
				description: 'overwrite exist file',
				defaultValue: false
			}]
		}

		this.makeCommand(
			generateNewAppCommandConfig,
			(
				projectName: string,
				opts: IGenerateCommandOptions
			) => {
				const generator = new tsGenerator({
					projectName,
					opts
				})
				generator.run(args);
			}
		);
		await this.program.parseAsync();
	}
}