'use strict'

let express = require('express')
let bodyParser = require('body-parser')
let fs = require('fs')

let app = express()

app.use(express.static('static'))

app.get('/', function (req, res) {
    res.sendFile('index.html')
})

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.post('/', (req, res) => {
    fs.readFile('static/db.json', (err, data) => {
        if (err) throw err;
        data = JSON.parse(data)
        data.push(req.body)
        fs.writeFile('static/db.json', JSON.stringify( data ), (err) => {
            if (err) throw err;
        });
    })
    res.send(req.body)
});

app.set('port', (process.env.PORT || 5000))
app.listen(app.get('port'), function () {
    console.log('listening on port', app.get('port'))
})
