require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432, // Port mặc định cho PostgreSQL là 5432
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    max: 10, // Số lượng kết nối tối đa trong pool
    idleTimeoutMillis: 30000, // Thời gian một kết nối được phép không hoạt động trước khi đóng
    connectionTimeoutMillis: 2000, // Thời gian chờ để thiết lập một kết nối mới (nếu hết kết nối trong pool)
});

// const connectDb = async () => {
//     try {
//         const res = await pool.query('SELECT NOW()');
//         console.log('Connected to the database successfully!', res.rows[0].now);
//     } catch (err) {
//         console.error('Failed to connect to the database!', err);
//         process.exit(1);
//     }
// };

module.exports = pool;
