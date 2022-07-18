### project-generator-cli

generate js/ts project by simple command.

#### usage

```shell
npm i @codesuperman/project-generator-cli -g
```

or

```shell
yarn add @codesuperman/project-generator-cli -g
```

- generate ts project: `pgc g test-project -o`
- generate js project: `pgc g test-project -o -t js`
- generate configuration in the existing project: `pgc g test-project -oc` (*Note: execute this command in the root directory of the target project*)

#### Options

```shell
Usage: pgc generate|g [options] <project-name>

Initialize a new ts/js project.

Arguments:
  project-name           The name of the entire project.

Options:
  -t, --template [type]  Add the specified template type for project. (default: "ts")
  -o, --overwrite        Overwrite exist file. (default: false)
  -oc, --only-config     Only configuration files are generated (default: false)
  -h, --help             display help for command
```