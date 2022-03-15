/*
Author: Mostafa Mohamed
Course: COMP 4522, Database II: Advanced Databases
MRU University, Calgary, Canada
*/
// Don't forget to globally install "Azure Functions Core Tools"
// npm install -g azure-functions-core-tools@3 --unsafe-perm true
const db = require("../Lib/db");

module.exports = async function (context, req) {
    context.log('Blog function started.');
    try {
        // create 1 db connection for all functions
        await db.init(context);
        let response = null;

        switch (req.method) {
            case "GET":
                response = await getFun(req);
                break;
            case "POST":    // Adds new post
                response = await addFun(req);
                break;
            case "PATCH":   // Update existing record
                response = await updateFun(req);
                break;
            case "DELETE":
                response = await deleteFun(req);
                break;
            default:
                throw Error(`${req.method} not allowed`)
        }
        context.res = {
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ response })
        };
        context.done();
    } catch (error) {
        context.log(error);
        context.res = {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
            body: { "stack": context.res.stack, "error": error }
        }
        return context.done();
    }
}


const getFun = async function (req) {
    if (req?.query.id || (req?.body && req?.body?.id)) {
        return await db.getPostsByIds([req?.query.id || req?.body?.id]);
    } else {
        // allows empty query to return all items
        return await db.getPosts();
    }
}

const addFun = async function (req) {
    let title = req?.query.title || (req?.body && req?.body?.title);
    let text = req?.query.text || (req?.body && req?.body?.text);
    if (title) {
        let ids = await db.Add([{ "Title": title, "Text": text }]);
        return await db.getPostsByIds(Object.values(ids.insertedIds));
    } else {
        throw Error("Please specify the blog title.");
    }
}

const updateFun = async function (req) {

    let id = req?.query.id || (req?.body && req?.body?.id);
    if (id) {
        // Construct the update object from the given title and/or text 
        let title = req?.query.title || (req?.body && req?.body?.title);
        let text = req?.query.text || (req?.body && req?.body?.text);
        let updateObj = title ? { "Title": title } : {};
        updateObj = text ? { ...updateObj, "Text": text } : updateObj;
        // Update the post
        let result = await db.updatePostsByIds([id], updateObj);
        return `Updated ${result.modifiedCount} posts`;
    } else {
        throw Error("No id found. Please specify the id.")
    }
}
// Returns the number of records deleted
const deleteFun = async function (req) {
    let id = req?.query.id || (req?.body && req?.body?.id);
    if (id) {
        let result = await db.deletePostsByIds([id]);
        return `Deleted ${result.deletedCount} posts`;
    } else {
        throw Error("No id found. Please specify the id.");
    }
}