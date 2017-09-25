const express = require('express');
const grapqlEndpoint = require('express-graphql');

const app = express();

const schema = require('./schema');

app.use('/graphql', grapqlEndpoint({
  schema,
  graphiql: true,
}));

app.listen(4000);
console.log('Listening ...');
