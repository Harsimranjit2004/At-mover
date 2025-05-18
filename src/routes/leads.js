const AWS = require('aws-sdk');
const express = require('express');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Initialize DynamoDB client
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const LEADS_TABLE = process.env.LEADS_TABLE || 'Leads';

// Create a new lead
router.post('/', async (req, res, next) => {
    try {
        const { name, email, phone, source } = req.body;
        const id = uuidv4();
        const timestamp = new Date().toISOString();

        const newLead = {
            id,
            name,
            email,
            phone,
            source,
            createdAt: timestamp,
            updatedAt: timestamp
        };

        await dynamoDb.put({
            TableName: LEADS_TABLE,
            Item: newLead
        }).promise();

        res.status(201).json(newLead);
    } catch (error) {
        next(error);
    }
});

// Get all leads
router.get('/', async (req, res, next) => {
    try {
        const result = await dynamoDb.scan({
            TableName: LEADS_TABLE
        }).promise();

        res.json(result.Items);
    } catch (error) {
        next(error);
    }
});

// Get lead by ID
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await dynamoDb.get({
            TableName: LEADS_TABLE,
            Key: { id }
        }).promise();

        if (!result.Item) {
            return res.status(404).json({ error: 'Lead not found' });
        }

        res.json(result.Item);
    } catch (error) {
        next(error);
    }
});

// Update lead
router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, email, phone, source } = req.body;
        const timestamp = new Date().toISOString();

        // Check if lead exists
        const checkResult = await dynamoDb.get({
            TableName: LEADS_TABLE,
            Key: { id }
        }).promise();

        if (!checkResult.Item) {
            return res.status(404).json({ error: 'Lead not found' });
        }

        // Update lead
        const result = await dynamoDb.update({
            TableName: LEADS_TABLE,
            Key: { id },
            UpdateExpression: 'SET #name = :name, email = :email, phone = :phone, source = :source, updatedAt = :updatedAt',
            ExpressionAttributeNames: {
                '#name': 'name'
            },
            ExpressionAttributeValues: {
                ':name': name,
                ':email': email,
                ':phone': phone,
                ':source': source,
                ':updatedAt': timestamp
            },
            ReturnValues: 'ALL_NEW'
        }).promise();

        res.json(result.Attributes);
    } catch (error) {
        next(error);
    }
});

// Delete lead
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;

        // Check if lead exists
        const checkResult = await dynamoDb.get({
            TableName: LEADS_TABLE,
            Key: { id }
        }).promise();

        if (!checkResult.Item) {
            return res.status(404).json({ error: 'Lead not found' });
        }

        await dynamoDb.delete({
            TableName: LEADS_TABLE,
            Key: { id }
        }).promise();

        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

module.exports = router;