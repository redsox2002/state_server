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
    if (!req.body.latitude || !req.body.longitude) {
        res.json({
            error: 'lat and long not specified in incoming JSON request'
        });
        res.end();
    }
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
        if (geolib.isPointInside({
                latitude: Number(req.body.latitude),
                longitude: Number(req.body.longitude)
            }, borders)) {
            foundState = stateName;
        }
    });
    if (foundState) {
        res.json({
            message: `${foundState}`
        });
        res.end();
    } else {
        res.json({
            error: 'Lat/Long not found in any state :('
        });
        res.end();
    }
});