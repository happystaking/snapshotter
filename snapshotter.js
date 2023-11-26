/**
 * Get Cardano stake pool snapshot data at the end of the epoch using the
 * goMaestro API and store it in a local SQLite database.
 */
import sqlite3 from 'sqlite3';
import axios from 'axios';
import rateLimit from 'axios-rate-limit';

sqlite3.verbose();

const goMaestroApiKey = '';
const goMaestroBaseUrl = 'https://mainnet.gomaestro-api.org/v1';
const axiosRL = rateLimit(axios.create(), { maxRPS: 8 })
let currentEpoch = null;
let goMaestroConfig = {
    method: 'get',
    maxBodyLength: Infinity,
    keepAlive: true,
    headers: {
        'Accept': 'application/json',
        'api-key': goMaestroApiKey
    }
};

// Exit if today is not the last day of the epoch.
if ((Math.floor((((new Date() - new Date("2017-09-23 23:44:51 +0000")) / 1000) / 86400)) % 5) != 4) {
    console.log('Today is not the last day of a Cardano epoch.'); process.exit();
}

// Connect to the database or tell the user how to prepare it.
const db = new sqlite3.Database('./snapshotter.sqlite', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        return console.error(`Database snapshotter.sqlite not found!\nRun the following command to create it:\n cat schema.sql | sqlite3 snapshotter.sqlite`);
    }
});

// Get the current epoch number using the API.
goMaestroConfig.url = goMaestroBaseUrl + '/epochs/current';
(async () => {
    await axiosRL(goMaestroConfig).then(function (response) {
        currentEpoch = response.data.data.epoch_no;
    }).catch(function (err) {
        console.error(err.message); process.exit(1);
    });
})()

// Select all pools from db, use API to query their delegations and
// insert API results in the SQLite snapshot table.
db.all(`select * from pool`, [], (err, rows) => {
    if (err) { throw err; }
    rows.forEach((row) => {
        goMaestroConfig.url = goMaestroBaseUrl + '/pools/' + row.bech32 + '/delegators';
        getPoolDelegations(row);
    });
});

// Helper function to get API results.
const getPoolDelegations = (row) => {
    const r = axiosRL(goMaestroConfig).then(response => {
        let d = response.data;
        insertPoolDelegations(row.id, d.data);
        console.log('Pool ID ' + row.id.toString().padStart(2, ' ') + '; Rows: ' + d.data.length.toString().padStart(3, ' ') + '; Next: ' + d.next_cursor);
        if (d.next_cursor !== null) {
            goMaestroConfig.url = goMaestroBaseUrl + '/pools/' + row.bech32 + '/delegators?cursor=' + d.next_cursor;
            getPoolDelegations(row);
        }
    }).catch(err => console.error(err.message));
}

// Helper function to insert records into the database.
const insertPoolDelegations = (id, delegations) => {
    delegations.forEach(delegation => {
        db.run(`
            insert into snapshot (
                stake_address,
                active_epoch_no,
                snapshot_epoch_no,
                amount,
                delegated_to,
                created_at)
            values (?, ?, ?, ?, ?, ?)`, [
                delegation.stake_address,
                delegation.active_epoch_no,
                currentEpoch,
                delegation.amount,
                id,
                Date.now()
            ], function (err) {
                if (err) { return console.error(err.message); }
            }
        );
    });
}
