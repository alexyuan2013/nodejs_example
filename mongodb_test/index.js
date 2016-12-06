var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://172.28.112.98:27017/pushdb';

var callback = function(result, db){
	console.log(result);
	db.close();
};

var insertDocuments = function(db, callback) {
  // Get the documents collection
  var collection = db.collection('testColl');
  // Insert some documents
  collection.insertMany([
    {a : 1}, {a : 2}, {a : 3}
  ], function(err, result) {
    console.log("Inserted 3 documents into the document collection");
    callback(result, db);
  });
};

var updateDocument = function(db, callback) {
  // Get the documents collection
  var collection = db.collection('testColl');
  // Update document where a is 2, set b equal to 1
  collection.updateOne({ a : 1 }
    , { $set: { b : 1 } }, function(err, result) {
    console.log("Updated the document with the field a equal to 2");
    callback(result,db);
  });  
};

var findDocuments = function(db, callback) {
  // Get the documents collection
  var collection = db.collection('testColl');
  // Find some documents
  collection.find({}).toArray(function(err, docs) {
    console.log("Found the following records");
    console.log(docs);
    callback(docs, db);
  });
};

var removeDocument = function(db, callback) {
  // Get the documents collection
  var collection = db.collection('testColl');
  // Insert some documents
  collection.deleteOne({ a : 3 }, function(err, result) {
    console.log("Removed the document with the field a equal to 3");
    callback(result, db);
  });    
};

var indexCollection = function(db, callback) {
  db.collection('testColl').createIndex(
    { "a": 1 },
      null,
      function(err, results) {
        //console.log(results);
        callback(results, db);
    }
  );
};

var findAllWithLimit = function(db, callback){
	
	db.collection('testColl').find().skip(2).limit(3).toArray(function(err, docs) {
	  console.log("Found the following records");
	  console.log(docs);
      callback(docs, db);
    });
	
}


MongoClient.connect(url, function(err, db) {
  //assert.equal(null, err);
  console.log("Connected correctly to server");
  //insertDocuments(db, callback);
  //updateDocument(db, callback);
  //findDocuments(db, callback);
  //removeDocument(db, callback);
  //indexCollection(db, callback);
  findAllWithLimit(db, callback);
});

