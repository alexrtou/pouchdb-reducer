var PouchDB = require('pouchdb');
var ld = require('leveldown-prebuilt');
PouchDB.plugin(require('pouchdb-authentication'));
//PouchDB.debug.enable('*');

console.log('pwd : ', process.cwd());

var spawn = require('child_process').spawn;

var serve = spawn(
  'node', ['node_modules/pouchdb-server/bin/pouchdb-server', '-p', '5984', '--level-backend', '"leveldown-prebuilt"'], {
    cwd: process.cwd()
  });

serve.stdout.on('data', function (data) {
  console.log('stdout: ' + data);

  if (data && data.toString().indexOf("pouchdb-server has started") > -1) {
    console.log('Serveur démarré');

    pouchTests();
  }
});

serve.stderr.on('data', function (data) {
  console.log('stderr: ' + data);
});

serve.on('close', function (code) {
  console.log('child process exited with code ' + code);
});

// Traitements et tests
var pouchTests = function () {

  var db = new PouchDB('http://localhost:5984/alex_db', {
    db: ld
  });

  db.destroy().then(function () {
    console.log('la base alex_db est détruite');
  }).catch(function (error) {
    console.log('delete db ', error);
  }).then(function () {
    return new PouchDB('http://localhost:5984/alex_db', {
      db: ld
    });
  }).then(function (db) {
    db.signup('batman', 'brucewayne', function (err, response) {
      if (err) {
        if (err.name === 'conflict') {
          console.log('"batman" already exists, choose another username');
        } else if (err.name === 'forbidden') {
          console.log('invalid username');
        } else {
          console.log('HTTP error, cosmic rays, etc.', err);
        }
      }
    });
    db.bulkDocs([
        {
          _id: 'manager',
          occupation: 'kitten',
          cuteness: 9.0,
          type: 'app'
  },
        {
          _id: 'test',
          occupation: 'kitten',
          cuteness: 7.0,
          type: 'app'
  },
        {
          _id: 'cadeau',
          occupation: 'kitten',
          cuteness: 8.0,
          type: 'app'
  },
        {
          _id: 'moi',
          name: 'alex',
          type: 'user',
          grant: {
            manager: 'admin',
            test: 'testeur'
          }
  },
        {
          _id: 'lui',
          name: 'fifou',
          type: 'user',
          grant: {
            test: ['testeur', 'testeur2']
          }
  },
        {
          _id: 'admin',
          app: 'manager',
          type: 'group'
  },
        {
          _id: 'testeur',
          app: 'test',
          type: 'group'
  },
        {
          _id: 'testeur2',
          app: 'test',
          type: 'group'
  },
        {
          _id: 'test_data_1',
          app: 'test',
          group: 'testeur'
  },
        {
          _id: 'test_data_2',
          app: 'test',
          group: 'testeur'
  },
        {
          _id: 'test_data_3',
          app: 'test',
          group: 'testeur'
  },
        {
          _id: 'test_data_4',
          app: 'test',
          group: 'testeur2'
  }])
      .then(function (res) {

        // Tous les tests du groupe 'group'
        db
          .query(function (doc, emit) {
            emit([doc.group, doc.app]);
          }, {
            key: ['testeur', 'test'],
            //include_docs: true
          })
          .then(function (result) {
            console.log('-------------------------------------------------------');
            console.log(JSON.stringify(result, null, ' '));
            console.log('-------------------------------------------------------');
          })
          .catch(function (err) {
            console.log(err);
          });


        // liste les utilisateurs de l'application
        var map = function (doc, emit) {
          if (doc.type === 'user') {

            for (var key in doc.grant) {
              var grs = [].concat(doc.grant[key]);
              for (var i in grs) {
                emit(grs[i], {
                  user: doc.name
                });
              }
            }

          }
          if (doc.type === 'group') emit(doc._id, {
            app: doc.app
          });
        };

        var reduce = function (keys, values) {
          var res = {
            users: [],
            apps: ''
          };
          for (var i in values) {
            var doc = values[i];
            if (doc.user) res.users.push(doc.user);
            if (doc.app) res.apps = doc.app;
          }
          return res;
        };

        db.query({
          map: map,
          reduce: reduce
        }, {
          reduce: true,
          group: true
            //include_docs: true
        }).then(function (result) {
          console.log('-------------------------------------------------------');
          console.log(JSON.stringify(result, null, ' '));
          console.log('-------------------------------------------------------');
        }).catch(function (err) {
          console.log(err);
        });


      })

    .catch(function (err) {
      console.log(err);
    });
  });




};
