const express = require('express');
const cors = require('cors');
const path = require('path');

const { loadImagesToDatabase } = require('./controllers/homeControllers');

require('dotenv').config();
const webRoutes = require('./routes/web');

const app = express();
app.use(cors({ credentials: true, origin: true }));

const port = process.env.PORT || 8080;
const hostname = process.env.HOST_NAME || 'localhost';
app.use('/images', express.static(path.join(__dirname, 'img_name-database')));
app.use(express.json({ limit: '25mb' })); // Used to parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: '25mb' })); // Parse URL-encoded bodies

app.use('/', webRoutes);

loadImagesToDatabase();

app.listen(port, hostname, () => {
    console.log(`Example app listening on port ${port}`);
});
