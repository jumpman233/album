var sqlite3 = require('sqlite3');

var db = new sqlite3.Database('./database.db');

db.serialize(function () {
  db.run(`CREATE TABLE user(
            id INTEGER(4) PRIMARY KEY,
            name TEXT NOT NULL,
            password TEXT NOT NULL)
          `);

  db.run(`INSERT INTO user (ID, NAME, PASSWORD) VALUES (0, 'admin', '123')`);
  // for(var i = 11; i < 20; i++) {
  //   db.run(`INSERT INTO user (ID, NAME, PASSWORD) VALUES ((SELECT max(Id) FROM user)+1, 'admin_${i}', '123')`);
  // }

  // db.each('select rowid AS id, user FROM user', function (err, row) {
  //   console.log(row.id);
  //   console.log(row.info);
  // })
});

db.close();
