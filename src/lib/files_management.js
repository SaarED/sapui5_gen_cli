import fs from 'fs';
import path from 'path';
import ncp from 'ncp';
import chalk from 'chalk';
import { promisify } from 'util';

import unzipper from 'unzipper';

ncp.ncp.limit = 100;

const copy = promisify(ncp);

const patternVars = {
    '%%APPNAME%%': 'name',
    '%%NAMESPACE%%': 'namespace',
    '%%VIEWNAME%%': 'view'
};

const folderToSkip = [
    'node_modules',
    'SDK'
]

const files_management = module.exports = {

    copyTemplateToDestination: async ( src, dest) => {

        if(!fs.existsSync(dest)) {
            fs.mkdirSync(dest);
        }
        fs.chmodSync(dest, 0o777);

        await copy(src, dest, (err) => {
            console.log( chalk.redBright(err) );
        });

        return true;
    },

    getSAPUI5Versions: () => {
        const folderPath = path.resolve( __dirname, '../../dependencies/UI5' );

        const readFolder = fs.readdirSync(folderPath, { withFileTypes: true })
                             .filter(dirent => dirent.isDirectory())
                             .map(dirent => dirent.name);
        
        return readFolder;
    },

    renameFiles: (config, dest) => {
        var foundFiles = fs.readdirSync(dest);

        foundFiles.forEach((file) => {
            
            var filePath = path.resolve(dest, file);
            
            var fileStat = fs.statSync(filePath);
            
            if(fileStat.isFile()) {
                for(let pattern in patternVars) {
                    let newFile;
                    var regex = new RegExp(pattern, "g");
                    if(regex.test(file)) {
                        newFile = filePath.replace(regex, config[patternVars[pattern]]);
                        fs.renameSync(filePath, newFile);
                    }
                }
            } else {
                if(!files_management.checkSkipFolders(filePath)) {
                    files_management.renameFiles(config, filePath);
                }
            }
        });

        return true;
    },

    setVarsInFiles: (config, dest) => {
        var foundFiles = fs.readdirSync(dest);

        foundFiles.forEach((file) => {
            
            var filePath = path.resolve(dest, file);
            
            var fileStat = fs.statSync(filePath);
            
            if(fileStat.isFile()) {
                fs.readFile(filePath, 'utf8', function (err,data) {
                    if (err) {
                        return console.log(err);
                    }

                    var result = data;
                    for(let pattern in patternVars) {
                        var regex = new RegExp(pattern, "g");
                        result = result.replace(regex, config[patternVars[pattern]]);
                    }

                    fs.writeFile(filePath, result, 'utf8', function (err) {
                        if (err) return console.log(err);
                    });
                });
            } else {
                if(!files_management.checkSkipFolders(filePath)) {
                    files_management.setVarsInFiles(config, filePath);
                }
            }
        });
        
        return true;
    },

    unzipFileToDest: async ( dest, zipfile ) => {
        return await new Promise((resolve) => {
            fs.createReadStream(zipfile).pipe(unzipper.Extract({path: dest})).on('finish', () => {
                resolve('Unzipped successfully');
            });
        });
    },

    deleteZipFile: ( zipfile ) => {
        return fs.unlinkSync( zipfile );
    },

    checkSkipFolders: ( dir ) => {
        return ( folderToSkip.includes( path.basename( dir ) ) );
    }
};

export default files_management;