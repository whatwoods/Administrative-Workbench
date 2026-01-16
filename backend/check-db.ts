import { db } from './src/db/index.js';
import { users } from './src/db/schema.js';

async function check() {
    try {
        const allUsers = await db.select().from(users).all();
        console.log('Current Users:', JSON.stringify(allUsers, null, 2));
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

check();
