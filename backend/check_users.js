const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/lms_db';

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    role: String,
    isApproved: Boolean
}, { collection: 'users' });

const User = mongoose.model('User', userSchema);

async function checkUsers() {
    try {
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const users = await User.find({});
        console.log(`Found ${users.length} users:`);
        users.forEach(u => {
            console.log(`- ${u.name} (${u.email}) [${u.role}] - Approved: ${u.isApproved !== false}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
    }
}

checkUsers();
