const { writeFileSync, mkdirSync } = require('fs');

require('dotenv').config();

const pathEnvs = './src/environments';

const targetPath = `${pathEnvs}/environment.ts`;
const targetPathDev = `${pathEnvs}/environment.dev.ts`;

// const apiBaseUrl = process.env['API_BASE_URL'];
const googleClientId = process.env['GOOGLE_CLIENT_ID'];

if (!googleClientId) {
    throw new Error('Environment variable GOOGLE_CLIENT_ID is missing');
};

const envFileContent = `
    export const environment = {
        googleClientId: '${googleClientId}',
    };
`;


mkdirSync(pathEnvs, { recursive: true });

writeFileSync(targetPath, envFileContent);
writeFileSync(targetPathDev, envFileContent);

console.log('Wrote environment files to', pathEnvs);