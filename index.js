const express = require('express')
const bodyParser = require('body-parser');
const app = express()
const port = 3000;
// Client connected list store in clients array
let clients = [];

// data to be sent to server
let data = [
    { userId: "1", status: 'pending', description: 'user1 description' },
    { userId: "2", status: 'pending', description: 'user2 description' },
    { userId: "3", status: 'pending', description: 'user3 description' },
];
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

function sendSEE(userId, res) {
    const interval = setInterval(() => {
        // check client is connected or not
        if (clients.find(user => user.userId === userId)) {
            console.log('interval called', userId, data);
            data = data.map(user => {
                if (user.userId === userId && user.status === 'pending') {
                    res.write(JSON.stringify(user));
                    // currently changing the status but it's depend on requirement.
                    return { ...user, 'status': 'sent' }
                }
                return user;
            })
        } else {
            res.end();
        }
    }, 3000);
    /** add client in clients array. 
    //currently I'm storing userID but we can store deviceId or other identifier 
    for same user can access event on different plateform like mobile & laptop at same time
     */
    clients.push({ userId, interval });
}
app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.write("Loading...");
    res.on('close', () => {
        console.log('closed', req.query.userId);
        const recordIndex = clients.findIndex(user => user.userId !== req.query.userId);
        clients.splice(recordIndex, 1);
        console.log('closed ==> ', clients.length, recordIndex);
    });
    res.on('error', (err) => {
        console.log('Error', err, req.query.userId);
    })
    // send sse event based on userId
    sendSEE(req.query.userId, res);
})

/** hit this endpoint along with data to send realtime sse to frontend */
app.post('/', (req, res) => {
    const body = req.body || {};
    data.push(body);
    res.send('saved')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});