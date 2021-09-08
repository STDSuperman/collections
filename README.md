# cli
Provide local develop, test or configure to generate by a simple command.

## packages

- project-generator

### project-generator

generate js/ts project by simple command.

#### usage

```shell
npm i @codesuperman/project-generator -g
```

or

```shell
yarn add @codesuperman/project-generator -g
```

- 生成ts项目：`pg g test-project -o`
- js项目：`pg g test-project -o -t js`

#### Options

```shell
Usage: project-generator generate|g [options] <project-name>

Initialize a new ts/js project.

Arguments:
  project-name           The name of the entire project

Options:
  -t, --template [type]  add the specified template type for project (default: "ts")
  -o, --overwrite        overwrite exist file (default: false)
  -h, --help             display help for command
```