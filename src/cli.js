import program from 'commander';
import figlet from 'figlet';
import chalk from 'chalk';
import init_program from './init_program';
import generate_program from './generate_program';

// Init 
export async function cli(args) {

    // Banner
    console.log(
        chalk.yellow(
            figlet.textSync('SAPUI5 CLI', {
                horizontalLayout: "fitted"
            })
        )
    );

    // Set cli version
    program.version('1.0.1').description('A CLI for developing with SAPUI5 projects.');

    // Init program
    program.command('init <name>').alias('i')
    .option('-t, --template <template>', 'Application template')
    .option('-s, --skipsdk', 'Skip SDK unzip')
    .action(async (name, options) => {
        await init_program.program(name, options);
    });

    program.command('generate [schema] [name]').alias('g')
    .action(async (schema, name) => {
        await generate_program.program(schema, name);
    });

    // Parse arguments
    program.parse(args);
}