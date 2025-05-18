// src/dynamoClient.js
const AWS = require("aws-sdk");

const dynamoDB = new AWS.DynamoDB.DocumentClient({
    region: "us-east-1" // or your region
});

module.exports = dynamoDB;
