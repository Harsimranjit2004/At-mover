const awsServerlessExpress = require('aws-serverless-express');
const app = require('./app');

// Create server
const server = awsServerlessExpress.createServer(app);

// Export handler for Lambda
exports.handler = (event, context) => {
    return awsServerlessExpress.proxy(server, event, context);
};