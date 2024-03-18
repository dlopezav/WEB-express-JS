const express = require('express');
const pg = require('pg');
const app = express();

var config = 'postgres://postgres:password@localhost:5432/postgres';

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
    console.log("ready");
    getSQLResult(req, res, sqlRequest, values)
})

app.post('/user', function(req,res) {
    var id = req.body.id;
    var sqlRequest = 'SELECT * FROM Person WHERE person_id = $1';
    var values = [id]
    getSQLResult(req, res, sqlRequest, values)
})

app.post('/saveUser', function(req,res) {
    var id = req.body.id;
    var FirstName = req.body.FirstName;
    var LastName = req.body.LastName;
    var Birthdate = req.body.Birthdate;
    var sqlRequest = '';

    if(id === -1) {
        sqlRequest = 'INSERT INTO Person (Person_FirstName, Person_LastName, Person_Birthdate) VALUES ($1, $2, $3)'
        +'RETURNING Person_ID';
        values = [FirstName, LastName, Birthdate]
    }else{
        sqlRequest = 'UPDATE Person SET Person_FirstName = $1, Person_LastName = $2, Person_Birthdate = $3 WHERE Person_ID = $4';
        values = [FirstName, LastName, Birthdate, id]
    }

    getSQLResult(req, res, sqlRequest, values)
})

app.post('/deleteUser', function(req,res) {
    var id = req.body.id;
    var sqlRequest = 'DELETE FROM Person WHERE Person_ID = $1';
    var values = [id]
    getSQLResult(req, res, sqlRequest, values)
})

app.post('/books', function(req,res) { 
    var sqlRequest = 'SELECT * FROM Book ORDER BY Book_Title';
    var values = []
    getSQLResult(req, res, sqlRequest, values)
})

app.post('/book', function(req,res) {
    var id = req.body.id;
    var sqlRequest = 'SELECT * FROM Book WHERE book_id = $1';
    var values = [id]
    getSQLResult(req, res, sqlRequest, values)
})

app.post('/saveBook', function(req,res) {
    var id = req.body.id;
    var Title = req.body.Title;
    var Authors = req.body.Authors;
    var sqlRequest = '';

    if(id === -1) {
        sqlRequest = 'INSERT INTO Book (Book_Title, Book_Authors) VALUES ($1, $2)'
        +'RETURNING Book_ID';
        values = [Title, Authors]
    }else{
        sqlRequest = 'UPDATE Book SET Book_Title = $1, Book_Authors = $2 WHERE Book_ID = $3';
        values = [Title, Authors, id]
    }

    getSQLResult(req, res, sqlRequest, values)
})

app.post('/deleteBook', function(req,res) {
    var id = req.body.id;
    var sqlRequest = 'DELETE FROM Book WHERE Book_ID = $1';
    var values = [id]
    getSQLResult(req, res, sqlRequest, values)
})

app.post('/borrowedBooks', function(req,res) {
    var sqlRequest = 'SELECT borrow_id, book_id, book_title, borrow_date, borrow_return FROM borrow NATURAL JOIN book NATURAL JOIN person WHERE person_id = $1';
    var values = [req.body.id]
    getSQLResult(req, res, sqlRequest, values)
})

app.post('/borrowBook', function(req,res) {
    var sqlRequest = 'INSERT INTO borrow (person_id, book_id, borrow_date, borrow_return) VALUES ($1, $2, $3, $4)';
    var values = [req.body.person_id, req.body.book_id, req.body.borrow_date, req.body.borrow_return]
    getSQLResult(req, res, sqlRequest, values)
})

app.post('/returnBorrow', function(req,res) {
    var sqlRequest = 'UPDATE borrow SET borrow_return = $1 WHERE borrow_id = $2';
    var values = [req.body.borrow_return, req.body.borrow_id]
    getSQLResult(req, res, sqlRequest, values)
})


app.listen(8000, () => {
    console.log('Server started!')
});