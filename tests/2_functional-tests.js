const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
    let testThread_id
    let testReply_id;
    test("Creating a new thread: POST request to /api/thread/{board}", function (done) {
        chai
            .request(server)
            .post("/api/threads/test-board_func")
            .set("content-type", "application/json")
            .send({ text: "text", delete_password: "de" })
            .redirects(0)
            .end(function (err, res) {
                assert.equal(res.status,302 );
                done();
            });
    });


    test("vieving the 10 most recent threads with 3 replies each: GET", function (done) {
        chai
            .request(server)
            .get("/api/threads/test-board_func")
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.exists(res.body[0], 'There is a thread');
                assert.equal(res.body[0].text, "text");
                testThread_id = res.body[0]._id;
                done();
            });
    });

    test("Deleting a thread with the incorrect password: DELETE request to /api/threads/{board} with an invalid delete_password", function (done){
        chai
            .request(server)
            .delete("/api/threads/test-board_func")
            .set("content-type", "application/json")
            .send({thread_id: testThread_id,delete_password:"dud"})
            .end(function(err,res){
                assert.equal(res.status, 200);
                assert.equal(res.text, "incorrect password");
                done();
            })
    });
    test("Reporting a thread: PUT request to /api/threads/{board}", function (done){
        chai
            .request(server)
            .put("/api/threads/test-board_func")
            .set("content-type", "application/json")
            .send({thread_id : testThread_id})
            .end(function (err, res){
                assert.equal(res.status, 200);
                assert.equal(res.text, "reported");
                done();
            });
    });

    test("Creating a new thread: POST request to /api/replies/{board}", function (done) {
        chai
            .request(server)
            .post("/api/replies/test-board_func")
            .set("content-type", "application/json")
            .send({ thread_id: testThread_id, text: "textR", delete_password: "deR" })
            .redirects(0)
            .end(function (err, res) {
                assert.equal(res.status,302 );
                done();
            });
    });

    test("Viewing a signle thread with all replies: GET request to /api/replies/{board}", function (done){
        chai
            .request(server)
            .get("/api/replies/test-board_func")
            .set("content-type", "application/json")
            .query({thread_id: testThread_id,})
            .end(function (err, res){
                assert.equal(res.status, 200)
                assert.equal(res.body._id, testThread_id);
                assert.equal(res.body.text, "text");
                assert.equal(res.body.replies[0].text, "textR")
                testReply_id = res.body.replies[0]._id;
                done();
            });

    });

    test("Deleting a reply with the incorrect password: DELETE request to /api/replies/{board} with an invalid delete_password", function (done){
        chai
            .request(server)
            .delete("/api/replies/test-board_func")
            .set("content-type", "application/json")
            .send({thread_id: testThread_id, reply_id: testReply_id, delete_password:"dud2"})
            .end(function(err,res){
                assert.equal(res.status, 200);
                assert.equal(res.text, "incorrect password");
                done();
            })
    });
   
    test("Reporting a reply: PUT request to /api/replies/{board}", function (done){
        chai
            .request(server)
            .put("/api/replies/test-board_func")
            .set("content-type", "application/json")
            .send({thread_id : testThread_id, reply_id: testReply_id})
            .end(function (err, res){
                assert.equal(res.status, 200);
                assert.equal(res.text, "reported");
                done();
            });
    });

    test("Deleting a reply with the correct password: DELETE request to /api/replies/{board} with a valid delete_password", function (done){
        chai
            .request(server)
            .delete("/api/replies/test-board_func")
            .set("content-type", "application/json")
            .send({thread_id: testThread_id, reply_id: testReply_id, delete_password:"deR"})
            .end(function(err,res){
                assert.equal(res.status, 200);
                assert.equal(res.text, "success");
                done();
            })
    });

    test("Deleting a thread with the correct password: DELETE request to /api/threads/{board} with a valid delete_password", function (done){
        chai
            .request(server)
            .delete("/api/threads/test-board_func")
            .set("content-type", "application/json")
            .send({thread_id: testThread_id,delete_password:"de"})
            .end(function(err,res){
                assert.equal(res.status, 200);
                assert.equal(res.text, "success");
                done();
            })
    });

});
