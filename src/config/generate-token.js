const readline = require('readline');
const { google } = require('googleapis');

const CLIENT_ID = 'xxx';
const CLIENT_SECRET = 'xxx';

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  'http://localhost'
);

const scopes = [
  'https://www.googleapis.com/auth/gmail.send'
];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes,
  prompt: 'consent'
});

console.log('\nAbra esta URL no navegador:\n');
console.log(authUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('\nCole o código aqui: ', async (code) => {
  try {
    const { tokens } = await oauth2Client.getToken(code);

    console.log('\nREFRESH TOKEN:\n');
    console.log(tokens.refresh_token);

    rl.close();
  } catch (err) {
    console.error(err);
    rl.close();
  }
});