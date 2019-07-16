const fs = require('fs');
const path = require('path');
const pathPrefix = [__dirname, '..', '..', 'app', 'vault'].join('/');
const variablesPath = path.resolve(pathPrefix, 'variables.json');
const { data: secrets } = require(path.resolve(pathPrefix, 'secrets.json'));
const { variables, files } = Object.keys(secrets).reduce(
  (acc, key) => {
    const isFile = key.match(/\./);
    const value = secrets[key];

    isFile ? acc.files.push([key, value]) : (acc.variables[key] = value);

    return acc;
  },
  { variables: {}, files: [] }
);

files.forEach(([key, value]) => {
  const filePath = path.resolve(pathPrefix, key);

  fs.writeFileSync(filePath, JSON.stringify(value), 'base64');

  console.log('wrote', filePath);
});

fs.writeFileSync(variablesPath, JSON.stringify(variables), 'utf8');
console.log('wrote', variablesPath);
