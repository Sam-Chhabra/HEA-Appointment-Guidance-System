import dotenv from 'dotenv';
dotenv.config();
import { createApp } from './app.js';
import { initializeDatabase } from './db/database.js';
const PORT = parseInt(process.env.PORT || '4000', 10);
// Initialize database (creates tables if they don't exist)
initializeDatabase();
const app = createApp();
app.listen(PORT, () => {
    console.log(`\n🏥 HEA Appointment Guidance System`);
    console.log(`   Backend running on http://localhost:${PORT}`);
    console.log(`   API base: http://localhost:${PORT}/api`);
    console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
});
//# sourceMappingURL=server.js.map