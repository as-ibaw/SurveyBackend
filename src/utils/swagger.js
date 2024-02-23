import 'dotenv/config';
import swaggerAutogen from 'swagger-autogen';

const port = process.env.PORT;

const doc = {
  info: {
    title: 'Survey API Overview',
  },
  host: 'localhost:' + port,
};

const outputFile = './swagger-output.json';
const routes = ['../index.js'];

swaggerAutogen()(outputFile, routes, doc);
