const express = require('express');
const cors = require('cors');
require('dotenv').config();

const webRoutes = require('./routes/web');

const app = express();
app.use(cors({ credentials: true, origin: true }));
const port = process.env.PORT || 8080
const hostname = process.env.HOST_NAME || 'localhost';

app.use(express.json()); //used to parsed JSON bodies
app.use(express.urlencoded({ extended: true })); //parsed url-encoded bodies;

app.use('/', webRoutes);


app.listen(port, hostname, () => {
    console.log(`Example app listening on port ${port}`)
})