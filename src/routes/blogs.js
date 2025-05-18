const AWS = require('aws-sdk');
const express = require('express');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Initialize DynamoDB client
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const BLOGS_TABLE = process.env.BLOGS_TABLE || 'Blogs';

// Create a new blog
router.post('/', async (req, res, next) => {
    try {
        const { title, content, author } = req.body;
        const id = uuidv4();
        const timestamp = new Date().toISOString();

        const newBlog = {
            id,
            title,
            content,
            author,
            createdAt: timestamp,
            updatedAt: timestamp
        };

        await dynamoDb.put({
            TableName: BLOGS_TABLE,
            Item: newBlog
        }).promise();

        res.status(201).json(newBlog);
    } catch (error) {
        next(error);
    }
});

// Get all blogs
router.get('/', async (req, res, next) => {
    try {
        const result = await dynamoDb.scan({
            TableName: BLOGS_TABLE
        }).promise();

        res.json(result.Items);
    } catch (error) {
        next(error);
    }
});

// Get blog by ID
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await dynamoDb.get({
            TableName: BLOGS_TABLE,
            Key: { id }
        }).promise();

        if (!result.Item) {
            return res.status(404).json({ error: 'Blog not found' });
        }

        res.json(result.Item);
    } catch (error) {
        next(error);
    }
});

// Update blog
router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, content, author } = req.body;
        const timestamp = new Date().toISOString();

        // Check if blog exists
        const checkResult = await dynamoDb.get({
            TableName: BLOGS_TABLE,
            Key: { id }
        }).promise();

        if (!checkResult.Item) {
            return res.status(404).json({ error: 'Blog not found' });
        }

        // Update blog
        const result = await dynamoDb.update({
            TableName: BLOGS_TABLE,
            Key: { id },
            UpdateExpression: 'SET #title = :title, #content = :content, author = :author, updatedAt = :updatedAt',
            ExpressionAttributeNames: {
                '#title': 'title',
                '#content': 'content'
            },
            ExpressionAttributeValues: {
                ':title': title,
                ':content': content,
                ':author': author,
                ':updatedAt': timestamp
            },
            ReturnValues: 'ALL_NEW'
        }).promise();

        res.json(result.Attributes);
    } catch (error) {
        next(error);
    }
});

// Delete blog
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;

        // Check if blog exists
        const checkResult = await dynamoDb.get({
            TableName: BLOGS_TABLE,
            Key: { id }
        }).promise();

        if (!checkResult.Item) {
            return res.status(404).json({ error: 'Blog not found' });
        }

        await dynamoDb.delete({
            TableName: BLOGS_TABLE,
            Key: { id }
        }).promise();

        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

module.exports = router;