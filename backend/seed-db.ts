import { db } from './src/db/index.js';
import { users } from './src/db/schema.js';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

async function seed() {
    try {
        const hashedPassword = await bcrypt.hash('awb990714', 10);
        const id = randomUUID();
        const now = new Date().toISOString();

        await db.insert(users).values({
            id,
            email: 'admin@awb.local',
            username: 'Way',
            password: hashedPassword,
            role: 'admin',
            createdAt: now,
            updatedAt: now,
        }).run();

        console.log('✅ Default user created manually');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

seed();
