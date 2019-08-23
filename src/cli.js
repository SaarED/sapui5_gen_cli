import program from 'commander';
import inquirer from 'inquirer';
import Listr from 'listr';
import process from 'process';
import path from 'path';
import figlet from 'figlet';
import chalk from 'chalk';

import files_management from './lib/files_management';

async function fillConfiguration(options) {
    let questions = [];
    
    // Check if template exsits
    let appTypes = ['XML', 'JS'];
    
    if(!options.template || !appTypes.includes(options.template)) {
        questions.push({
            type: 'list',
            name: 'template',
            message: 'Please choose which project template to use',
            choices: appTypes,
            default: appTypes[0],
        });
    }

    // Ask for namespace
    questions.push({
        type: 'input',
        name: 'namespace',
        message: 'Please enter namespace',
        validate: function(inp) {
            return (inp) ? true : 'Please fill that input.';
        }
    });

    // Ask for view
    questions.push({
        type: 'input',
        name: 'view',
        message: 'Please enter view',
        validate: function(inp) {
            return (inp) ? true : 'Please fill that input.';
        }
    });

    // Choose UI5 SDK Version
    let sapui5Versions = files_management.getSAPUI5Versions();
    questions.push({
        type: 'list',
        name: 'sapui5',
        message: 'Please choose which sapui5 version to use',
        choices: sapui5Versions,
        default: sapui5Versions[0],
    });

    // Wait for answers
    let answers = await inquirer.prompt(questions);
    
    return {
        name: options.appName,
        template: answers.template || options.template,
        namespace: answers.namespace,
        view: answers.view,
        sapui5: answers.sapui5
    };
}

// Print instructions
function printInstructions(configuration) {
    console.log('\n\n\n');
    console.log('%s Successfully created project %s', chalk.bgGreen('DONE'), configuration.name);
    console.log('\n');
    console.log('Start developing with the commands:');
    console.log('\n');
    console.log(chalk.blueBright('cd ', configuration.name));
    console.log(chalk.blueBright('npm start'));
    console.log('\n');

    console.log( chalk.yellow('Enjoy!') );
}

// Init program
async function initProgram(name, options) {
    let configuration = await fillConfiguration({ appName: name, template: options.template });

    const tasks = new Listr([
        {
            title: 'Copying template files',
            task: async () => {
                return await files_management.copyTemplateToDestination( 
                    path.resolve( __dirname, '../templates', configuration.template ), 
                    path.resolve( process.cwd(), configuration.name ) 
                );
            }
        },
        {
            title: 'Setting up Grunt enviroment',
            task: async () => {
                return await files_management.copyTemplateToDestination( 
                    path.resolve( __dirname, '../dependencies/Grunt' ), 
                    path.resolve( process.cwd(), configuration.name ) 
                );
            }
        },
        {
            title: 'Setting UI5 SDK',
            task: () => {
                return new Listr([
                    {
                        title: 'Copying SDK',
                        task: async () => {
                            return await files_management.copyTemplateToDestination( 
                                path.resolve( __dirname, '../dependencies/UI5', configuration.sapui5 ), 
                                path.resolve( process.cwd(), configuration.name, 'SDK' ) 
                            );
                        }
                    },
                    {
                        title: 'Unzip SDK',
                        task: () => files_management.unzipFileToDest(
                            path.resolve( process.cwd(), configuration.name, 'SDK' ),
                            path.resolve( process.cwd(), configuration.name, 'SDK', 'SDK.zip' ),
                        )
                    },
                    {
                        title: 'Removing SDK zip',
                        task: () => files_management.deleteZipFile(
                            path.resolve( process.cwd(), configuration.name, 'SDK', 'SDK.zip' ),
                        )
                    },
                ])
            }
        },
        {
            title: 'Setting configuration',
            task: async () => {
                return new Listr([
                    {
                        title: 'Rename files',
                        task: async () => {
                            await files_management.renameFiles( configuration, path.resolve( process.cwd(), configuration.name ) );
                            return true;
                        }
                    },
                    {
                        title: 'Set settings in files',
                        task: async () => {
                            await files_management.setVarsInFiles( configuration, path.resolve( process.cwd(), configuration.name ) );
                            return true;
                        }
                    }
                ]);
            }
        }
    ]);    

    await tasks.run();

    // Output done        
    printInstructions(configuration);


    return true;
}

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
        await initProgram(name, options);
    });

    // Parse arguments
    program.parse(args);
}