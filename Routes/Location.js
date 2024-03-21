const express = require('express');
const route = express.Router();
const Location = require('../db/model');

// Route to add a location
route.post('/addlocation', async (req, res) => {
    const { driverId, latitude, longitude } = req.body;

    if (!driverId || !latitude || !longitude) {
        return res.status(400).send("Please provide the necessary data.");
    }

    try {
        const newLocation = new Location({
            driverId,
            latitude,
            longitude,
        });

        await newLocation.save();
        return res.status(200).send(newLocation);
    }
    catch {
        return res.status(500).send('Error in adding the location.');
    }
});

// Function to calculate distance between two points
function getDistance(point1, point2) {
    const cal = Math.sqrt(
        Math.pow(point2.latitude - point1.latitude, 2) +
        Math.pow(point2.longitude - point1.longitude, 2)
    );
    return parseInt(cal, 10);
}

// Route to get analytics for a driver's distance driven in a day
route.post('/getanalytics', async (req, res) => {
    const { driverId, date } = req.body;
    if (!driverId || !date) {
        return res.status(400).send("Please enter all data.");
    }

    const givenDate = new Date(date);
    if (isNaN(givenDate)) {
        return res.status(400).send("Invalid date.");
    }
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    try {
        const driverLocationData = await Location.find({
            driverId,
            createdAt: { $gte: startDate, $lte: endDate },
        }).sort({ createdAt: 1 });
        const n = driverLocationData.length;
        if (n === 0) {
            return res.status(404).send("No data found.");
        }
        let sum = 0;
        for (let i = 1; i < n; i++) {
            sum += getDistance(driverLocationData[i - 1], driverLocationData[i]);
        }

        return res.status(200).json({ sum });
    }
    catch {
        return res.status(500).send("Error in finding analytics.");
    }
});

// Route to get hotspots in the city on a given day
route.post('/gethotspots', async (req, res) => {
    const { date } = req.body;

    if (!date) {
        return res.status(400).send("Please enter all data.");
    }

    const givenDate = new Date(date);
    if (isNaN(givenDate)) {
        return res.status(400).send("Invalid date.");
    }

    try {
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        const locations = await Location.aggregate([
            { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
            { $group: { _id: { lat: "$latitude", lng: "$longitude" }, count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        return res.status(200).json(locations);
    } catch (error) {
        return res.status(500).send("Internal server error.");
    }
});

exports = module.exports = {
    Location: route
};
