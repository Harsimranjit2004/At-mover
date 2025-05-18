const express = require('express');
const cors = require('cors');
const usersRouter = require('./routes/users');
const blogsRouter = require('./routes/blogs');
const leadsRouter = require('./routes/leads');

// Initialize Express app
const app = express();

// Add middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Load routers
app.use('/users', usersRouter);
app.use('/blogs', blogsRouter);
app.use('/leads', leadsRouter);

// Add 404 route
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).json({
        error: err.message || 'Internal Server Error'
    });
});

module.exports = app;