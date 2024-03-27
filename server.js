require('dotenv').config('.env');
const express = require('express');
const { Location } = require('./Routes/Location')
require('dotenv').config('.env');

const app = express();
const PORT = process.env.PORT || 4000;


// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Home route
app.get('/', (req, res) => {
    res.send("Hello World");
});

app.use('/location', Location);

// Start server
app.listen(PORT, () => {
    console.log("Server is running on port:", PORT);
    console.log("Access the server at:", `http://localhost:${PORT}`);
});


