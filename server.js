const express = require('express');
const pg = require('pg');
const app = express();

var config = 'postgres://postgres:password@localhost:5432/tpwebbd';

// PostgreSQL configuration
const pool = new pg.Pool({
    connectionString: config,
  });

app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next()
});

app.post("/authenticate", function(req,res) {
    var login = req.body.login;
    var password = req.body.password;

    var jsonString;

    if((login === "admin") && (password === "admin")) {
        jsonString = JSON.stringify({ok:1});
    }else{
        jsonString = JSON.stringify({ok:0});
    }
    res.setHeader('Content-Type', 'application/json');
    res.send(jsonString);

})

function getSQLResult(req, res, sqlRequest, values) {
    pool.connect(function(err, client, done) {
        if(err) {
            // Cannot connect
            console.error('Cannot connect to PostgreSQL:', err);
            res.status(500).json({ error: 'Database connection error' });
            done(); // Release the client back to the pool
        } else {
            console.log(req, 'req here')
            client.query(sqlRequest, values, function(err, result) {
                done(); // Release the client back to the pool
                if(err) {
                    console.error('Bad request:', err);
                    res.status(500).json({ error: 'Bad request error' });
                } else {
                    res.setHeader('Content-Type', 'application/json');
                    res.json(result.rows); // Send the result as a JSON object
                }
            });
        }
    });
}

app.post('/users', function(req,res) {
    var sqlRequest = 'SELECT * FROM Person ORDER BY Person_LastName, Person_FirstName';
    var values = []
    getSQLResult(req, res, sqlRequest, values)
})


app.listen(8000, () => {
    console.log('Server started!')
});