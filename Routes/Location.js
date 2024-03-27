// Import required modules
const express = require('express');
const route = express.Router();
const kmeans = require('node-kmeans');

// Import Firestore-related modules
const db = require('../firebase');
const { addDoc, collection, query, where, orderBy, getDocs } = require('firebase/firestore');


// Route to add a location
route.post('/addlocation', async (req, res) => {
    // Extract data from request body
    const { driverId, latitude, longitude } = req.body;

    // Validate input data
    if (!driverId || !latitude || !longitude) {
        return res.status(400).send("Please provide the necessary data.");
    }

    try {
        // Create a new location object
        const newLocation = {
            driverId,
            latitude,
            longitude,
            createdAt: new Date(),
        };

        // Add the new location to the Firestore collection
        await addDoc(collection(db, 'Location'), newLocation);
        return res.status(200).send(newLocation);
    }
    catch {
        return res.status(500).send("Error in Adding Location.");
    }

});

// Function to calculate distance between two points
function getDistance(point1, point2) {

    const Radius = 6371e3; // metres
    const φ1 = point1.latitude * Math.PI / 180;
    const φ2 = point2.latitude * Math.PI / 180;
    const Δφ = (point1.latitude - point2.latitude) * Math.PI / 180;
    const Δλ = (point1.longitude - point2.longitude) * Math.PI / 180;

    // a = sin²(Δφ/2) + cos φ1 ⋅ cos φ2 ⋅ sin²(Δλ/2) ( Haversine Formulae )
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    // c = 2 ⋅ atan2( √a, √(1−a) )
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    // d = (R ⋅ c)/1000
    const cal = (Radius * c) / 1000; // In meters

    return parseInt(cal, 10);
}

// Route to get analytics for a driver's distance driven in a day
route.post('/getanalytics', async (req, res) => {
    // Extract data from request body
    const { driverId, date } = req.body;

    // Validate input data
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
        // Construct Firestore query
        const locationRef = collection(db, 'Location');
        const q = query(
            locationRef,
            where('driverId', '==', driverId),
            where('createdAt', '>=', startDate),
            where('createdAt', '<=', endDate),
            orderBy('createdAt', 'asc')
        );

        // Execute the query and retrieve location data
        const querySnapshot = await getDocs(q);
        const driverLocationData = querySnapshot.docs.map(doc => doc.data());

        const n = driverLocationData.length;
        if (n === 0) {
            return res.status(404).send("No data found.");
        }

        let TotalDistanceTravelled = 0;

        // Calculate total distance travelled
        for (let i = 1; i < n; i++) {
            TotalDistanceTravelled += getDistance(driverLocationData[i - 1], driverLocationData[i]);
        }

        // Return analytics data
        return res.status(200).json({ TotalDistanceTravelled });
    }
    catch {
        return res.status(500).send("Error in finding analytics.");
    }
});

// Route to get hotspots in the city on a given day
route.post('/gethotspots', async (req, res) => {

    // Extract data from request body
    const { date } = req.body;

    // Validate input data
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

        // Construct Firestore query to retrieve locations for the given day
        const locationRef = collection(db, 'Location');
        const q = query(
            locationRef,
            where('createdAt', '>=', startDate),
            where('createdAt', '<=', endDate),
        );

        // Execute the query and retrieve location data
        const querySnapshot = await getDocs(q);
        const locations = querySnapshot.docs.map(doc => doc.data());

        const dataPoints = locations.map(loc => [loc.latitude, loc.longitude]);
        // k-clustering Algorithm
        kmeans.clusterize(dataPoints, { k: Math.min(5, dataPoints.length) }, (err, result) => {
            if (err) {
                return res.status(500).send("Error in clustering");
            }

            const hotspots = result.map(cluster => ({
                centroid: {
                    latitude: cluster.centroid[0],
                    longitude: cluster.centroid[1]
                },
                size: cluster.cluster.length
            }));

            // Return hotspots data
            return res.status(200).json(hotspots);
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal server error.");
    }
});

exports = module.exports = {
    Location: route
};
