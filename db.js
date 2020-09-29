const Pool = require('pg').Pool;

const pool = new Pool({
    user: 'postgres',
    password: 'indra12345$',
    host: 'localhost',
    port: 5432,
    database: 'minimato'
});

module.exports = pool;