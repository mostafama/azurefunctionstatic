/*
Author: Mostafa Mohamed
Course: COMP 4522, Database II: Advanced Databases
MRU University, Calgary, Canada
*/
// Create a MongoDB account and set the connection string in file: local.settings.json
// After you deploy on Azure, you must add the connection string 
// "MongoAtlasConnectionString" with its value in the:
// Azure Portal-> Your Function App-> Configuration-> Application Settings (Not connection string)
const mongodb = require('mongodb');
const db_connection_str = process.env["MongoAtlasConnectionString"];
const DB_NAME = "blog_azure_functions";
const COLLECTION_NAME = "posts";
let db = null;
let _context = null;

// MongoDB CRUD Operations
// https://docs.mongodb.com/manual/crud/

// Initialization function
module.exports.init = async (context) => {
    if (!db) {
        _context = context;
        // Connect only if there is no current connection, otherwise, reuse connection
        let connection = await mongodb.MongoClient.connect(db_connection_str);
        db = connection.db(DB_NAME);
        _context.log('Success, created new DB connection.');
    }
};

module.exports.getPosts = async (query = {}) => {
    return await db.collection(COLLECTION_NAME).find(query).toArray();
};

module.exports.getPostsByIds = async (ids = []) => {
    const id_objects = ids.map(id => mongodb.ObjectId(id))
    return await db.collection(COLLECTION_NAME).find({ _id: { $in: id_objects } }).toArray();
};

// Returns a promise that provides a result
// The result.insertedIds field contains an array with the _id of each newly inserted document.
module.exports.Add = async (posts = []) => {  // array of posts to be inserted
    return await db.collection(COLLECTION_NAME).insertMany(posts);
};

// returns a promise that provides a result. 
// The result.deletedCount property contains the number of documents that matched the filter.
module.exports.deletePostsByIds = async (ids = []) => {
    const id_objects = ids.map(id => mongodb.ObjectId(id))
    return await db.collection(COLLECTION_NAME).deleteMany({ _id: { $in: id_objects } });
};

// returns a promise that provides a result. 
// The result.modifiedCount property contains the number of documents that matched the filter.
module.exports.updatePostsByIds = async (ids, modification) => {
    const id_objects = ids.map(id => mongodb.ObjectId(id))
    return await db.collection(COLLECTION_NAME).updateMany(
        { _id: { $in: id_objects } },
        { $set: modification }
    );
};