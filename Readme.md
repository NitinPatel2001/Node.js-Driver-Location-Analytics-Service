# Node.js Driver Location Analytics Service

This Node.js service collects driver location data continuously and provides analytics around how much distance the driver has driven in a day and identifies hotspots in a city on a given day.

## Environment Variables

This project uses environment variables for configuration. Create a `.env` file in the root directory of the project and add the following variables:

- `MONGODB_URL`: URL for connecting to MongoDB

Example `.env` file:

```
MONGODB_URL=
```

## Installation

1. Clone this repository to your local machine.
2. Navigate to the project directory.
3. Install dependencies using npm:

```bash
npm install
```

## Usage

1. Start the server:

```bash
npm start
```

2. Send POST requests to the following endpoints to interact with the service:

   - `/addlocation`: Add driver location data.
   - `/getanalytics`: Get analytics for a driver's distance driven in a day.
   - `/gethotspots`: Get hotspots in the city on a given day.

## Endpoints

### 1. Add Location (`/addlocation`)

Adds driver location data to the database.

#### Request

- Method: POST
- Body:
  ```json
  {
    "driverId": "123456",
    "latitude": 37.7749,
    "longitude": -122.4194
  }
  ```

#### Response

- Success:
  - Status Code: 200
  - Response Body: New location data saved successfully.

- Failure:
  - Status Code: 400
  - Response Body: Please provide the necessary data.

### 2. Get Analytics (`/getanalytics`)

Get analytics for a driver's distance driven in a day.

#### Request

- Method: POST
- Body:
  ```json
  {
    "driverId": "123456",
    "date": "2023-01-01"
  }
  ```

#### Response

- Success:
  - Status Code: 200
  - Response Body: JSON object containing the sum of distances driven by the driver on the specified date.

- Failure:
  - Status Code: 400
  - Response Body: Please enter all data.

### 3. Get Hotspots (`/gethotspots`)

Get hotspots in the city on a given day.

#### Request

- Method: POST
- Body:
  ```json
  {
    "date": "2023-01-01"
  }
  ```

#### Response

- Success:
  - Status Code: 200
  - Response Body: JSON array containing the top 10 hotspots in the city on the specified date.

- Failure:
  - Status Code: 400
  - Response Body: Please enter all data.