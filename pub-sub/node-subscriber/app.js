// ------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
// ------------------------------------------------------------

const express = require('express');
const bodyParser = require('body-parser');

const app = express();

require('isomorphic-fetch');

// Dapr publishes messages with the application/cloudevents+json content-type
app.use(bodyParser.json({ type: 'application/*+json' }));

const port = 3000;


const daprPort = process.env.DAPR_HTTP_PORT || 3500;
const pendingchannel = `pending`;
const daprUrl = `http://localhost:${daprPort}/v1.0/pubsub/${pendingchannel}`;
const stateStoreName = `statestore`;
const stateUrl = `http://localhost:${daprPort}/v1.0/state/${stateStoreName}`;
const pubsubName = 'pubsub';

app.get('/dapr/subscribe', (_req, res) => {
    res.json([
        {
            pubsubname: "pubsub",
            topic: "channelA",
            route: "A"
        },
        {
            pubsubname: "pubsub",
            topic: "channelB",
            route: "B"
        }
    ]);
});

app.post('/A', async (req, res) => {
    console.log("A: ", req.body.data.message);
    const keyname = req.body.data.message;
    res.sendStatus(200);
    // let promise = new Promise((resolve, reject) => {
    // setTimeout(() => resolve("done!"), 5000)
    // });
    // try {
    //     let result = await promise;
    //     console.log('waiting for 5000ms')
    //     res.sendStatus(200);
    // } catch(e) {
    //     console.log(e);
    //     res.sendStatus(500);
    // }

    const data = req.body.data.message;
   
    const state = [{
        key: keyname,
        value: "pending"
    }];

    const pendingqueue = [{
        key: "pending",
        value: keyname
    }];

    console.log(state);

    fetch(stateUrl, {
        method: "POST",
        body: JSON.stringify(state),
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then((response) => {
        if (!response.ok) {
            throw "Failed to persist state.";
        }

        console.log("Successfully persisted state.");
        res.status(200).send();

     })
     .catch((error) => {
        console.log(error);
        res.status(500).send({message: error});
    });
});

// app.post('/A', async (req, res) => {
//     console.log("A: ", req.body.data.message);
//     //let promise = new Promise((resolve, reject) => {
//     //setTimeout(() => resolve("done!"), 90000)
//     //});
//     try {
//         //let result = await promise;
//         console.log('Not able to process')
//         res.sendStatus(500);
//     } catch(e) {
//         console.log(e);
//         res.sendStatus(500);
//     }
// });

app.post('/B', (req, res) => {
    console.log("B: ", req.body.data.message);
    res.sendStatus(200);
});

app.listen(port, () => console.log(`Node App listening on port ${port}!`));
