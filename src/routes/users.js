const AWS = require('aws-sdk');
const express = require('express');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Initialize DynamoDB client
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const USERS_TABLE = process.env.USERS_TABLE || 'Users';

// Create a new user
router.post('/', async (req, res, next) => {
    try {
        const { name, email } = req.body;
        const id = uuidv4();
        const timestamp = new Date().toISOString();

        const newUser = {
            id,
            name,
            email,
            createdAt: timestamp,
            updatedAt: timestamp
        };

        await dynamoDb.put({
            TableName: USERS_TABLE,
            Item: newUser
        }).promise();

        res.status(201).json(newUser);
    } catch (error) {
        next(error);
    }
});

// Get all users
router.get('/', async (req, res, next) => {
    try {
        const result = await dynamoDb.scan({
            TableName: USERS_TABLE
        }).promise();

        res.json(result.Items);
    } catch (error) {
        next(error);
    }
});

// Get user by ID
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await dynamoDb.get({
            TableName: USERS_TABLE,
            Key: { id }
        }).promise();

        if (!result.Item) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(result.Item);
    } catch (error) {
        next(error);
    }
});

// Update user
router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, email } = req.body;
        const timestamp = new Date().toISOString();

        // Check if user exists
        const checkResult = await dynamoDb.get({
            TableName: USERS_TABLE,
            Key: { id }
        }).promise();

        if (!checkResult.Item) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update user
        const result = await dynamoDb.update({
            TableName: USERS_TABLE,
            Key: { id },
            UpdateExpression: 'SET #name = :name, email = :email, updatedAt = :updatedAt',
            ExpressionAttributeNames: {
                '#name': 'name'
            },
            ExpressionAttributeValues: {
                ':name': name,
                ':email': email,
                ':updatedAt': timestamp
            },
            ReturnValues: 'ALL_NEW'
        }).promise();

        res.json(result.Attributes);
    } catch (error) {
        next(error);
    }
});

// Delete user
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;

        // Check if user exists
        const checkResult = await dynamoDb.get({
            TableName: USERS_TABLE,
            Key: { id }
        }).promise();

        if (!checkResult.Item) {
            return res.status(404).json({ error: 'User not found' });
        }

        await dynamoDb.delete({
            TableName: USERS_TABLE,
            Key: { id }
        }).promise();

        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

module.exports = router;