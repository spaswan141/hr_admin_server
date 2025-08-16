const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, '..', 'routes');
const routeFiles = fs.readdirSync(routesDir).filter(file => file.endsWith('.route.js')); // Changed to .js for consistency

routeFiles.forEach(file => {

    const routeName = file.split('.route.js')[0].toLowerCase();
    const routePath = `/${routeName}`;

    const routeModule = require(path.join(routesDir, file));
    router.use(routePath, routeModule);
});

module.exports = router;