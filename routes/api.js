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

//POST
//

async function threadsPOST(req, res) {
    console.log("Tpost", req.body);
    const { text, delete_password } = req.body
    let board = req.body.board;
    if (!board) {
        board = req.params.board;
    }
    const date = new Date();
    const newThread = new mThread({
        text: text,
        created_on: date,
        bumped_on: date,
        delete_password: delete_password,

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

async function replyPOST(req, res) {
    console.log("Rpost", req.body);
    const { thread_id, text, delete_password } = req.body;
    const board = req.params.board;
    const newReply = new mReply({
        text: text,
        delete_password: delete_password,
    });
    let boardData = await findBoard(board);
    if (!boardData) {
        res.json({ error: "Board not found" });
        return
    }
    const date = new Date();
    let threadToAddReply = boardData.threads.id(thread_id);
    if (threadToAddReply === null) {
        res.json({ error: " not found" });
        return
    }
    threadToAddReply.bumped_on = date;
    threadToAddReply.replies.push(newReply);
    boardData.save((err, data) => {
        if (err || !data) {
            res.send("There was an error saving in post");
        } else {
            res.redirect(`/b/${board}/${thread_id}`);
        }
    });
}

//GET
//

async function threadsGET(req, res) {
    console.log("Tget", req.body);
    const board = req.params.board;
    let boardData = await findBoard(board);
    if (!boardData) {
        console.log("No board with this name");
        res.send("No board with this name")
        return;
    }
    let threads = boardData.threads.sort((a, b) => {
        if (a.bumped_on > b.bumped_on) {
            return -1;
        }
    });
    threads.length = Math.min(threads.length, 10);

    threads = threads.map(function (e) {
        const {
            _id,
            text,
            created_on,
            bumped_on,
        } = e;
        const replies = e.replies.slice(-1 * Math.min(e.replies.length, 3));
        return {
            _id,
            text,
            created_on,
            bumped_on,
            replies,
            replycount: e.replies.length,

        }
    });

    console.log(threads);

    res.json(threads);
}

async function replyGET(req, res) {
    console.log("Rget", req.body);
    const board = req.params.board;
    let boardData = await findBoard(board);
    if (!boardData) {
        res.json({ error: "Board not found" });
        return;
    }
    const thread = boardData.threads.id(req.query.thread_id);
    res.json(thread);
}

//PUT
//

async function threadPUT(req, res) {
    console.log("Tput", req.body)
    const { report_id } = req.body;
    const board = req.param.board;
    let boardData = await findBoard(board);
    if (!boardData) {
        res.json({ error: "Board not found" });
        return
    }
    const date = new Date();
    let reportedThread = boardData.threads.id(report_id);
    reportedThread = true;
    reportedThread.bumped_on = date;
    boardData.save((err, updateData) => {
        res.send("Success");
    });
}

async function replyPUT(req, res) {
    console.log("Rput", req.body);
    const { thread_id, reply_id } = req.body;
    const board = req.params.board;
    let boardData = await findBoard(board);
    if (!boardData) {
        res.json({ error: "Board not found" });
        return;
    }
    let thread = boardData.threads.id(thread_id);
    let reply = thread.replies.id(reply_id);
    reply.reported = true;
    reply.bumped_on = new Date();
    data.save((err, updateData) => {
        if (!err) {
            res.send("Success");
        }
    });

}

//DELETE
//

async function threadDELETE(req, res) {
    console.log("Tdelete", req.body);
    const { thread_id, delete_password } = req.body;
    const board = req.params.board;
    let boardData = await findBoard(board);
    if (!boardData) {
        res.json({ error: "Board not found" })
        return;
    }

    let threadToDel = boardData.threads.id(thread_id);
    if (!(threadToDel.delete_password === delete_password)) {
        res.send("Incorect Password");
        return;

    }
    threadToDel.remove();
    boardData.save((err, updateData) => {
        res.send("Success");
    });


}

async function replyDELETE(req, res) {
    console.log("Rdelete", req.body);
    const { thread_id, reply_id, delete_password } = req.body;
    const board = req.params.board;
    let boardData = await findBoard(board);
    if (!boardData) {
        res.json({ error: "Board not found" });
        return;
    }
    let thread = boardData.threads.id(thread_id);
    let reply = thread.replies.id(reply_id);
    if (!(reply.delete_password === delete_password)) {
        res.send("Incorrect Password");
        return;
    }
    reply.text = "[deleted]"


    boardData.save((err, updatedData) => {
        if (err) {
            return;
        }
        res.send("Success");

    });
}




module.exports = function (app) {


    app.route('/api/threads/:board')
        .post(threadsPOST)
        .get(threadsGET)
        .put(threadPUT)
        .delete(threadDELETE);

    app.route('/api/replies/:board')
        .post(replyPOST)
        .get(replyGET)
        .put(replyPUT)
        .delete(replyDELETE);

};
