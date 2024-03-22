require('dotenv').config('.env');
const express = require('express');
const { Location } = require('./Routes/Location'); // Importing the location routes
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 4000;

// MongoDB connection URL
const mongoDBURL = process.env.MONGODB_URL;

// Connect to MongoDB
mongoose.connect(mongoDBURL)
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((err) => {
        console.error("Failed to connect to MongoDB:", err);
    });

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Home route
app.get('/', (req, res) => {
    res.send("Hello World");
});

// Location routes
app.use('/location', Location);

// Start server
app.listen(PORT, () => {
    console.log("Server is running on port:", PORT);
    console.log("Access the server at:", `http://localhost:${PORT}`);
});
