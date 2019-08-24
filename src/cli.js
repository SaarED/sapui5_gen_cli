import program from 'commander';
import figlet from 'figlet';
import chalk from 'chalk';
import init_program from './init_program';

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
    program.version('1.0.1');

    // Init program
    program.command('init <name>').alias('i')
    .option('-t, --template <template>', 'Application template')
    .action(async (name, options) => {
        await init_program.program(name, options);
    });

    // Parse arguments
    program.parse(args);
}