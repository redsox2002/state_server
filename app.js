const restify = require('restify');
const server = restify.createServer();
const fs = require('fs');
const geolib = require('geolib');
server.use(restify.plugins.bodyParser());

let states;
//First, lets read the contents of states:

fs.readFile('states.json', 'utf-8', (err, data) => {
    if (err || !data) throw Error('Unable to read states!');
    try {
        states = JSON.parse(data);
    } catch (e) {
        throw Error('Unable to parse states.json');
    }
    console.log('Server now listening on port 8080');
    server.listen(8080);
});


server.post('/', (req, res) => {
    // If the lat or long aren't in the request body, throw the error
    if (!req.body.latitude || !req.body.longitude) {
        res.json({
            error: 'lat and long not specified in incoming JSON request'
        });
        res.end();
    }
    /*
    If a state is a found, get the lat and long from the states.json file
    Since states.json is an array of arrays, the first element of the array
    [0] was the long, and the second [1] was the lat.  This constructs the
    array that geolib is looking for
    */
    let foundState;
    states.forEach(state => {
        const stateName = state.state;
        const borders = [];
        state.border.forEach(border => {
            borders.push({
                longitude: border[0],
                latitude: border[1]
            });
        });
    /*
    The first param for isPointInside is an object with lat, long
    The second param is an array of objects with polygon points
    */
        if (geolib.isPointInside({
                latitude: Number(req.body.latitude),
                longitude: Number(req.body.longitude)
            }, borders)) {
            foundState = stateName;
        }
    });
    // If points found, print the state.
    if (foundState) {
        res.json({
            message: `${foundState}`
        });
        res.end();
    // If not found, print error message
    } else {
        res.json({
            error: 'Lat/Long not found in any state :('
        });
        res.end();
    }
});