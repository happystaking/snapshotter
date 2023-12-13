/**
 * Store Cardano stake pool snapshot data from Koios into a local SQLite database.
 */
import sqlite3 from 'sqlite3';
import axios from 'axios';
import rateLimit from 'axios-rate-limit';
import { program } from 'commander';

sqlite3.verbose();

const koiosApiKey = '';
const koiosBaseUrl = 'https://api.koios.rest/api/v1';
const axiosRL = rateLimit(axios.create(), { maxRPS: 8 })
let currentEpoch = null;
let koiosConfig = {
    method: 'get',
    maxBodyLength: Infinity,
    keepAlive: true,
    headers: {
        'accept': 'application/json',
        'authorization': 'Bearer ' + koiosApiKey
    }
};

// Parse commandline arguments
program.name('snapshotter.js')
    .description('Store Cardano stake pool snapshot data from Koios into a local SQLite database.')
    .usage('[OPTIONS]...')
    .option('-e, --epoch <number>', 'the epoch number to save a snapshot of')
    .option('-f, --force', 'disregard the constraint to run on last epoch day')
    .version('0.1.0', '-v, --version')
    .parse(process.argv);
const options = program.opts();

// Exit if today is not the last day of the epoch.
if (((Math.floor((((new Date() - new Date("2017-09-23 23:44:51 +0000")) / 1000) / 86400)) % 5) != 4) && !options.force) {
    console.log('Today is not the last day of a Cardano epoch.'); process.exit();
}

// Connect to the database or tell the user how to prepare it.
const db = new sqlite3.Database('./snapshotter.sqlite', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        return console.error(`Database snapshotter.sqlite not found!\nRun the following command to create it:\n cat schema.sql | sqlite3 snapshotter.sqlite`);
    }
});

// Set the current epoch number
if (options.epoch !== '') {
    currentEpoch = options.epoch;
} else {
    koiosConfig.url = koiosBaseUrl + '/tip';
    await axiosRL(koiosConfig).then(function (response) {
        currentEpoch = response.data[0].epoch_no;
    }).catch(function (err) {
        console.error(err.message); process.exit(1);
    });
}

// Select all pools from db, use API to query their delegations and
// insert API results in the SQLite snapshot table.
db.all(`select * from pool`, [], (err, rows) => {
    if (err) { throw err; }
    rows.forEach((row) => {
        koiosConfig.url = koiosBaseUrl + '/pool_delegators_history?_pool_bech32=' + row.bech32 + '&_epoch_no=' + currentEpoch;
        getPoolDelegations(row);
    });
});

// Helper function to get API results.
const getPoolDelegations = (row) => {
    const r = axiosRL(koiosConfig).then(response => {
        let contentRange = response.headers['content-range'].substring(0, response.headers['content-range'].indexOf('/')).split('-');
        insertPoolDelegations(row.id, response.data);
        console.log('Pool: ' + row.ticker.toString().padEnd(5, ' ') + '   Range: ' + contentRange[0].padStart(5, ' ') + ' - ' + contentRange[1].padStart(5, ' '));
        if (contentRange[1].slice(-3) == '999') {
            koiosConfig.url = koiosBaseUrl + '/pool_delegators_history?_pool_bech32=' + row.bech32 + '&_epoch_no=' + currentEpoch + '&offset=' + (parseInt(contentRange[1], 10) + 1);
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
                epoch_no,
                amount,
                delegated_to,
                created_at)
            values (?, ?, ?, ?, ?)`, [
                delegation.stake_address,
                delegation.epoch_no,
                delegation.amount,
                id,
                Date.now()
            ], function (err) {
                if (err) { return console.error(err.message); }
            }
        );
    });
}
