# SAPUI5 CLI

CLI for developing project in SAPUI5 **UNOFFICIAL**

## Getting Started

use the keyword sapui5, form information use

```
sapui5_gen_cli -h
```

## Usage

### Use help

check all commands in 

```
sapui5_gen_cli -h
sapui5_gen_cli --help
```

### Initalize project

Initialize sapui5 project in folder

```
sapui5_gen_cli init|i [options] <name>
```

name - the project name

#### Options

* -t or --template name - the project template (XML or JS)


### Generate scheme

Generate view or fragment in the project folder

schema - view/fragment
name - name of the view/fragment

```
generate|g [schema] [name]
```

## Contributing

Use pull request and send push requests.

## Versioning

* 1.1.0 - Adding generate command
* 1.0.1 - Spliting files for adding more commands
* 1.0.0 - Initial and base files for the project

## Authors

* **Saar Shalom (SaarED)** - *Initial work* - [SaarED](https://github.com/SaarED)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE) file for details