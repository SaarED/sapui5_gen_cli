import inquirer from 'inquirer';
import Listr from 'listr';
import process from 'process';
import path from 'path';
import chalk from 'chalk';
import files_management from './lib/files_management';

const generate_program = module.exports = {
    fillConfiguration: async (options) => {
        let questions = [];
        
        // Check if template exsits
        let schemaTypes = ['view', 'fragment'];
        
        if(!options.schema || !schemaTypes.includes(options.schema)) {
            questions.push({
                type: 'list',
                name: 'schema',
                message: 'Please choose which schema to generate',
                choices: schemaTypes,
                default: schemaTypes[0],
            });
        }

        // Ask for namespace
        if(!options.schemaname) {
            questions.push({
                type: 'input',
                name: 'schemaname',
                message: 'Please enter name',
                validate: function(inp) {
                    return (inp) ? true : 'Please fill that input.';
                }
            }); 
        }

        // Wait for answers
        let answers = await inquirer.prompt(questions);
        
        let conf = {
            name: options.name,
            namespace: options.namespace,
            template: options.template,
            schema: answers.schema || options.schema
        };

        conf[conf.schema] = answers.schemaname || options.schemaname;

        return conf;
    },

    // Print instructions
    printInstructions: (configuration) => {
        console.log('%s Successfully created %s %s', chalk.bgGreen(' DONE '), configuration.schema, configuration.name);
    },

    // Init program
    program: async (schema, name) => {
        let configuration = await files_management.getManifestConfiguration( process.cwd() );
        if(configuration) {

            // Configuration
            configuration.schemaname = name;
            configuration.schema = schema;
            configuration = await generate_program.fillConfiguration(configuration);
            
            // Tasking
            const tasks = new Listr([
                {
                    title: 'Copying template files',
                    task: async () => {
                        // Copy schema
                        return await files_management.copyTemplateToDestination(
                            path.resolve( __dirname, '../templates', configuration.schema+'-'+configuration.template ), 
                            path.resolve( process.cwd() ) 
                        ).catch((e) => console.log(e));
                    },
                },
                {
                    title: 'Setting configuration',
                    task: async () => {
                        return new Listr([
                            {
                                title: 'Rename files',
                                task: async () => {
                                    await files_management.renameFiles( 
                                        configuration, 
                                        path.resolve( process.cwd(), 'webapp' ) 
                                    );
                                    return true;
                                }
                            },
                            {
                                title: 'Set settings in files',
                                task: async () => {
                                    await files_management.setVarsInFiles( 
                                        configuration, 
                                        path.resolve( process.cwd(), 'webapp' ) 
                                    );
                                    return true;
                                }
                            }
                        ]);
                    }
                }
            ]);    
            
            await tasks.run();
            
            // Output done        
            generate_program.printInstructions(configuration);
            
        } else {
            console.log( chalk.bgRed("ERROR, Can't find app type.") );
        }
        return true;
    }
};

export default generate_program;