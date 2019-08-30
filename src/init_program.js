import inquirer from 'inquirer';
import Listr from 'listr';
import process from 'process';
import path from 'path';
import chalk from 'chalk';
import files_management from './lib/files_management';

const init_program = module.exports = {
    fillConfiguration: async (options) => {
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
            sapui5: answers.sapui5,
            skipsdk: options.skipsdk
        };
    },

    // Print instructions
    printInstructions: (configuration) => {
        console.log('\n\n');
        console.log('%s Successfully created project %s in %dms', chalk.bgGreen(' DONE '), configuration.name, configuration.process_time);
        console.log('\n');
        console.log('Start developing with the commands:');
        console.log('\n');
        console.log(chalk.blueBright('cd ', configuration.name));
        console.log(chalk.blueBright('npm start'));
        console.log('\n');
        console.log( chalk.yellow('Enjoy!') );
    },

    // Init program
    program: async (name, options) => {
        let configuration = await init_program.fillConfiguration({ appName: name, template: options.template });

        let time_start = new Date();

        const tasks = new Listr([
            {
                title: 'Copying template files',
                task: async () => {

                    // Init project
                    await files_management.copyTemplateToDestination( 
                        path.resolve( __dirname, '../templates/init' ), 
                        path.resolve( process.cwd(), configuration.name ) 
                    );

                    // Copy view
                    await files_management.copyTemplateToDestination(
                        path.resolve( __dirname, '../templates', 'view-'+configuration.template ), 
                        path.resolve( process.cwd(), configuration.name ) 
                    );

                    return true;
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
                },
                enabled: () => !options.skipsdk
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

        configuration.process_time = new Date() - time_start;

        // Output done
        init_program.printInstructions(configuration);


        return true;
    }
};

export default init_program;