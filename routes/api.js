'use strict';

const mBoard = require("../schema").mBoard
const mThread = require("../schema").mThread
const mReply = require("../schema").mReply

async function findBoard(board) {
    try {
        return await mBoard.findOne({ name: board })
    } catch (err) {
        console.log(err);
        res.send("There was an error finding the board in database");
    }
}

async function threadsPOST(req, res) {
    const { text, delete_password } = req.body
    let board = req.body.board;
    if (!board) {
        board = req.params.board;
    }

    const newThread = new mThread({
        text: text,
        delete_password: delete_password,
        replies: [],
    });

    let boardData = await findBoard(board);


    if (!boardData) {

        const newBoard = new mBoard({
            name: board,
            threads: [newThread],
        });
        console.log("CreatedBoard", newBoard);
        newBoard.save((err, data) => {
            if (err || !data) {
                console.log(err);
                res.send("There was an error saving a new board in post");
            } else {
                res.redirect(`/b/${board}`)
            }

        });
        return;

    }

    boardData.threads.push(newThread);
    boardData.save((err, data) => {
        if (err || !data) {
            res.send("There was an error saving in post");
        } else {
            res.redirect(`/b/${board}`)
        }
    });

}

async function threadsGET(req, res) {
    const board = req.params.board;
    let boardData = await fidnBoard(board);
    if (!boardData) {
        console.log("No board with this name");
        res.send("No board with this name")
        return;
    }
    const threads = boardData.threads.map((thread) => {
        const {
            _id,
            text,
            created_on,
            bumped_on,
            reported,
            delete_password,
            replies,
        } = thread;
        return {
            _id,
            text,
            created_on,
            bumped_on,
            reported,
            delete_password,
            replies,
            replycount: thread.replies.length,
        };

    });
    res.json(threads);
    res.redirect(`/b/${board}`)
}

async function threadsGETRest(req, res) {

}


module.exports = function (app) {


    app.route('/api/threads/:board')
        .post(threadsPOST)
        .get(threadsGET)
        .put((req, res) => {
            console.log("put", req.body)
            const { report_id } = req.body;
            const board = req.param.board;
            mBoard.findOne({ name: board }, (err, boardData) => {
                if (!boardData) {
                    res.json({ error: "Board not found" });
                } else {
                    const date = new Date();
                    let reportedThread = boardData.threads.id(report_id);
                    reportedThread = true;
                    reportedThread.bumped_on = date;
                    boardData.save((err, updateData) => {
                        res.send("Success");
                    });
                }
            });
        })
        .delete((req, res) => {
            console.log("delete", req.body);
            const { thread_id, delete_password } = req.body;
            const board = req.params.board;
            mBoard.findOne({ name: board }, (err, boardData) => {
                if (!boardData) {
                    res.json({ error: "Board not found" })
                } else {
                    let threadToDel = boardData.threads.id(thread_id);
                    if (threadToDel.delete_password === delete_password) {
                        threadToDel.remove();
                    } else {
                        res.send("Incorect Password");
                        return;
                    }
                    boardData.save((err, updateData) => {
                        res.send("Success");
                    });
                }
            });
        });

    app.route('/api/replies/:board?thread_id=:thread_id')
        .get(threadsGETRest);
    app.route('/api/replies/:board')
        .post((req, res) => {
            console.log("thread", req.body);
            const { thread_id, text, delete_password } = req.body;
            const board = req.params.board;
            const newReply = new mReply({
                text: text,
                delete_password: delete_password,
            });
            mBoard.findOne({ name: board }, (err, boardData) => {
                if (!boardData) {
                    res.json({ error: "Board not found" });
                } else {
                    const date = new Date();
                    let threadToAddReply = boardData.threads.id(thread_id);
                    threadToAddReply.bumped_on = date;
                    threadToAddReply.replies.push(newReply);
                    boardData.save((err, updatedData) => {
                        res.json(updatedData)
                    });
                }

            });
        })
        .get((req, res) => {
            const board = req.params.board;
            let data = wait findBoard(board);
            if (!data) {
                res.json({ error: "Board not found" });
                return;
            }
            const thread = data.threads.id(req.query.thread_id);
            res.json(thread);
        })
        .put((req, res) => {
            const { thread_id, reply_id } = req.body;
            const board = req.params.board;
            mBoard.findOne({ name: board }, (err, data) => {
                if (!data) {
                    res.json({ error: "Board not found" });
                } else {
                    let thread = data.threads.id(thread_id);
                    let reply = thread.replies.id(reply_id);
                    reply.reported = true;
                    reply.bumped_on = new Date();
                    data.save((err, updateData) => {
                        if (!err) {
                            res.send("Success");
                        }
                    });

                }
            });
        })
        .delete((req, res) => {
            const { thread_id, reply_id, delete_password } = req.body;
            const board = req.params.board;
            mBoard.findOne({ name: board }, (err, data) => {
                if (!data) {
                    res.json({ error: "Board not found" });
                } else {
                    let thread = data.threads.id(thread_id);
                    let reply = thread.replies.id(reply_id);
                    if (reply.delete_password === delete_password) {
                        reply.remove();
                    } else {
                        res.send("Incorrect Password");
                        return;
                    }
                    data.save((err, updatedData) => {
                        if (!err) {
                            res.send("Success");
                        }
                    });
                }
            });
        });

};
