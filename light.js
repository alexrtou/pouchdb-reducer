var PouchDB = require('pouchdb');
var MyPouch = PouchDB.defaults({
  db: require('leveldown-prebuilt'),
  prefix: 'datas/',
  auto_compaction:true
});

PouchDB.plugin({
  sayHello: function () {
    this.info().then(function (result) {
      console.log('info from : ', result);
    }).catch(function (err) {
      console.log('erreur hello', err);
    });
  }
});

PouchDB.debug.enable('*');

var db_old = new MyPouch('alex_db');

db_old

  .destroy()

.catch(function (error) {
  console.log('delete db ', error);
})

.then(function () {

  console.log('la base alex_db est détruite');

  var db = new MyPouch('alex_db');
  db.sayHello();


  var allTestDuGroupe = function () {
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
  };

  var listeUtilisateursByApp = function () {
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
  };

  var listeUtilisateursByAppIdx = function () {
    // liste les utilisateurs de l'application
    var map = function (doc) {
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


    var myIndex = {
      _id: '_design/my_index',
      views: {
        'my_index': {
          map: map.toString(),
          reduce: reduce.toString()
        }
      }
    };
    // save it
    db.put(myIndex).then(function () {
      console.log('index créé');
      // kick off an initial build, return immediately
      return db.query('my_index', {
        reduce: true,
        group: true
      });
    }).then(function (result) {
      console.log('-------------------------------------------------------');
      console.log('requête persistente');
      console.log(JSON.stringify(result, null, ' '));
      console.log('-------------------------------------------------------');
    }).catch(function (err) {
      console.log(err);
    });

  };

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
        type: 'group',
        auth: {
          read: true,
          create: true,
          update: true,
          delete: true
        }
  },
      {
        _id: 'testeur',
        app: 'test',
        type: 'group',
        auth: {
          read: true,
          create: false,
          update: false,
          delete: false
        }
  },
      {
        _id: 'testeur2',
        app: 'test',
        type: 'group',
        auth: {
          read: true,
          create: true,
          update: true,
          delete: false
        }
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
    .then(function () {

      //allTestDuGroupe();

      //listeUtilisateursByApp();

      //listeUtilisateursByAppIdx();

      db.allDocs({
        startkey: 'test',
        include_docs: false
      }).then(function (result) {
        console.log('-------------------------------------------------------');
        console.log('requête persistente');
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
