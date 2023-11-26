# snapshotter.js

Get Cardano stake pool snapshot data at the end of the epoch using the goMaestro API and store it in a local SQLite database.

## Prerequisites
You need SQLite and Node.js installed on your system. For a Debian/Ubuntu-based system you can install those by running this command:

```
sudo apt install sqlite3 nodejs
```

## Installation
Clone the repository and enter the `snapshotter` directory. Open the `snapshotter.js` file and set the `goMaestroApiKey` to your API key.

To install the package dependencies, run:
```
npm install
```

Create the database schema:
```
cat schema.sql | sqlite3 snapshotter.sqlite
```

Create a `systemd timer` and `service` as displayed below. The systemd timer will trigger daily, but the snapshotter.js script will only insert the snapshot data on the last day of the epoch.

```
/etc/systemd/system/snapshotter.timer
-------------------------------------------------
[Unit]
Description=Periodic run of snapshotter.js

[Timer]
OnCalendar=*-*-* 21:35:00 UTC
Unit=snapshotter.service

[Install]
WantedBy=timers.target
```

Change the `ExecStart` and `Workingdirectory` paths in the service unit below to point to your `snapshotter.js` file and it's containing directory.

```
/etc/systemd/system/snapshotter.service
-------------------------------------------------
[Unit]
Description=Snapshotter.js

[Service]
Type=oneshot
ExecStart=/usr/bin/node /path/to/snapshotter.js
WorkingDirectory=/path/to

[Install]
WantedBy=multi-user.target
```

Enable and start the timer:
```
sudo systemctl enable --now snapshotter.timer
```

Done.
