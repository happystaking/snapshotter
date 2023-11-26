--
-- Schema
--

--
-- Stake pools to take snapshots of.
create table pool (
    id integer not null primary key autoincrement,
    ticker VARCHAR(5) null,
    name VARCHAR(64) null,
    bech32 VARCHAR(64) null,
    created_at datetime not null default CURRENT_TIMESTAMP
);

--
-- Snapshots of addresses and amounts delegated to a pool per epoch.
create table snapshot (
    id integer not null primary key autoincrement,
    stake_address varchar(64) not null,
    active_epoch_no INT not null,
    snapshot_epoch_no INT not null,
    amount DOUBLE PRECISION NULL,
    delegated_to INT not null,
    created_at datetime not null default CURRENT_TIMESTAMP,
    unique(stake_address, snapshot_epoch_no, delegated_to) on conflict replace
);

--
-- Blacklisted stake addresses are still inserted when taking snapshots.
-- This table is to be used when querying final results from all snapshots.
create table blacklist (
    id integer not null primary key autoincrement,
    stake_address varchar(64) not null,
    reason varchar(128) not null,
    created_at datetime not null default CURRENT_TIMESTAMP
);

--
-- Data
--

insert into pool (`ticker`, `name`, `bech32`, `created_at`) values ('DEV','DEV Pool','pool1e2tl2w0x4puw0f7c04mznq4qz6kxjkwhvuvusgf2fgu7q4d6ghv','2023-11-24 12:00:00');
insert into pool (`ticker`, `name`, `bech32`, `created_at`) values ('CONGE','Congee','pool1fxmancs3dmc9l0s7u7zrj8334m9nvzam5t5hnuuf4c7cjr6867m','2023-11-24 12:00:00');
insert into pool (`ticker`, `name`, `bech32`, `created_at`) values ('RUMOR','RUMOR','pool1c30lqt59t8sjn5lg04r5wk5eucxa5h9cj05xs9gzc8lngl4cmta','2023-11-24 12:00:00');
insert into pool (`ticker`, `name`, `bech32`, `created_at`) values ('DAPP','DAPP Central','pool1qakys0fxx5p2fxcnsc2tyjpqa88q7qgtdh5t3a32hplv6fg25r9','2023-11-24 12:00:00');
insert into pool (`ticker`, `name`, `bech32`, `created_at`) values ('KTOP','KTOP','pool135h773klt7djljmyawkh88e8qc457wxqfhc6j9h6y9n4y3sgh7t','2023-11-24 12:00:00');
insert into pool (`ticker`, `name`, `bech32`, `created_at`) values ('APOLO','APOLO','pool1ccr56kt2f5tzjvztlkf8zhkpvaawkduwfye8ydsk646lz0m4h5x','2023-11-24 12:00:00');
insert into pool (`ticker`, `name`, `bech32`, `created_at`) values ('RCADA','RCADA','pool1p82vmqednsalje23mpnz9u3qt9ruj79xu83mr6p8t93fw5fcu3y','2023-11-24 12:00:00');
insert into pool (`ticker`, `name`, `bech32`, `created_at`) values ('CRFA','Cardano Fans','pool1d3gckjrphwytzw2uavgkxskwe08msumzsfj4lxnpcnpks3zjml3','2023-11-24 12:00:00');
insert into pool (`ticker`, `name`, `bech32`, `created_at`) values ('HAPPY','HAPPY Staking Pool','pool1a8n7f97dmgtgrnl53exccknjdchqxrr9508hlxlgqp6xvjmzhej','2023-11-24 12:00:00');
insert into pool (`ticker`, `name`, `bech32`, `created_at`) values ('ADACT','ADA CAPITAL','pool1y24nj4qdkg35nvvnfawukauggsxrxuy74876cplmxsee29w5axc','2023-11-24 12:00:00');
insert into pool (`ticker`, `name`, `bech32`, `created_at`) values ('ASN','ADA Starnode','pool17ynruzy9lvq0x55ks22vtf4lrrdrw2ucydh4tfzhg9kkyeaw8nf','2023-11-24 12:00:00');
insert into pool (`ticker`, `name`, `bech32`, `created_at`) values ('SANTO','Santo','pool1nqm7rm98j5z027kdfcf09kunacz2w672xzx2ucdxacs954r5dul','2023-11-24 12:00:00');
insert into pool (`ticker`, `name`, `bech32`, `created_at`) values ('VFS','VFLAME','pool1vqjyjsp6dawkj8tzmfpu39hvgnkph99qzarw4dll6yq76gpaa4d','2023-11-24 12:00:00');
insert into pool (`ticker`, `name`, `bech32`, `created_at`) values ('CARDS','Cardanistas','pool1jt7d6ak3m8gnjyxtuxfswe258xzwda80ndl0a57vv5m2zv8h6at','2023-11-24 12:00:00');
insert into pool (`ticker`, `name`, `bech32`, `created_at`) values ('BBHMM','BBHMM','pool10p6wd9k0fwk2zqkqnqr8efyr7gms627ujk9dxgk6majskhawr6r','2023-11-24 12:00:00');
insert into pool (`ticker`, `name`, `bech32`, `created_at`) values ('MTERA','MeteraProtocol ISPO','pool1uct8k7ruvu3dgl9hws4pj3tk9stzpls4evnys4r8q5vj2p9w92w','2023-11-24 12:00:00');

insert into blacklist (`stake_address`, `reason`, `created_at`) values ('stake1uyty3f2syg0tg5l0q7ufjtcj4g4d9cfmhkrs05vzvkrgg0st84zts','Minswap delegation HAPPY','2023-11-24 12:00:00');