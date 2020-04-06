// This script builds the index for accessing the token assets.
// If tokens have changed, this must be run before the 'build' command .

const fs = require('fs').promises;
const path = require('path');

(async () => {
  const CONFIG_PATH = path.resolve('src/assets');
  const TOKEN_PATH = path.resolve(
    process.env.REACT_APP_TOKEN_PATH || 'src/assets/tokens'
  );
  interface Config {
    [tokenName: string]: {
      [filename: string]: string;
    };
  }

  const configInterface = `interface Config {
    [tokenName: string]: {
      [filename: string]: {
        color: string;
        src: string;
      };
    };
  }`;

  try {
    const imports: string[] = [];
    const configs: Config = {};
    const dirs = await fs.readdir(TOKEN_PATH);
    await Promise.all(
      dirs.map(async (dirName: string) => {
        configs[dirName] = {};
        const files: string[] = await fs.readdir(`${TOKEN_PATH}/${dirName}`);
        files.forEach((fileName: string) => {
          const name = fileName.substring(0, fileName.lastIndexOf('.'));
          const importName = `${dirName}_${name}`;
          configs[dirName][name] = `{ color: '', src: ${importName} }`;
          imports.push(
            `import ${importName} from './${TOKEN_PATH.substring(
              CONFIG_PATH.length + 1
            )}/${dirName}/${fileName}';`
          );
        });
      })
    );
    const configString = JSON.stringify(configs);
    const fileString: string = `${imports.join('\n')}
    \n${configInterface}  
    \nconst config: Config = ${configString.replace(/"/g, '')};
    \nexport default config;`;
    
    await fs.unlink(`${CONFIG_PATH}/index.ts`).catch((err: Error) => {});
    await fs.writeFile(`${CONFIG_PATH}/index.ts`, fileString);
  } catch (error) {
    console.error('Could not write token index:', error);
  }
})();

export {};
