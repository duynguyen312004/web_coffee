const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'coffee_shop',
    password: '123456',
    port: 5432,
});

function saveBase64Image(base64String, filename) {
    let matches = base64String.match(/^data:(.+);base64,(.+)$/);
    if (!matches) {
        // Try adding the prefix if it's missing
        base64String = `data:image/webp;base64,${base64String}`;
        matches = base64String.match(/^data:(.+);base64,(.+)$/);
    }

    if (!matches || matches.length !== 3) {
        console.warn(`Invalid base64 string for file ${filename}`);
        return null;
    }

    const imageData = matches[2];
    const buffer = Buffer.from(imageData, 'base64');
    const filePath = path.join(__dirname, '../img-database', filename);

    // Ensure the directory exists
    fs.mkdirSync(path.dirname(filePath), { recursive: true });

    fs.writeFileSync(filePath, buffer);

    return filename;
}

async function updateImageNames() {
    const client = await pool.connect();
    try {
        const result = await client.query('SELECT id, img_path FROM product');

        for (const row of result.rows) {
            const filename = `product_${row.id}.webp`; // Đặt tên tệp ảnh dựa trên id sản phẩm
            const savedFilename = saveBase64Image(row.img_path, filename);

            if (savedFilename) {
                // Cập nhật cột img_name trong cơ sở dữ liệu
                await client.query(
                    'UPDATE product SET img_name = $1 WHERE id = $2',
                    [filename, row.id]
                );
            } else {
                console.log(`Skipping file for product ID ${row.id} due to invalid base64 string`);
            }
        }

        console.log('Update completed');
    } catch (error) {
        console.error('Error updating image paths:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

updateImageNames();
