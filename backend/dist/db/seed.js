import { getDb, initializeDatabase } from './database.js';
import { hashPassword } from '../utils/password.js';
async function seed() {
    console.log('Seeding database...');
    initializeDatabase();
    const db = getDb();
    // Hash password BEFORE transaction because better-sqlite3 transactions must be synchronous
    const pwHash = await hashPassword('password123');
    // Start transaction
    const seedTransaction = db.transaction(() => {
        // 1. Departments
        const departments = [
            { name: 'General Medicine', description: 'Primary care and general health issues', keywords: 'fever, checkup, general' },
            { name: 'Cardiology', description: 'Heart and cardiovascular system', keywords: 'heart, chest pain, blood pressure' },
            { name: 'Dermatology', description: 'Skin, hair, and nails', keywords: 'skin, rash, acne, mole' },
            { name: 'Orthopedics', description: 'Bones, joints, ligaments', keywords: 'bone, joint, back pain' },
            { name: 'Neurology', description: 'Nervous system and brain', keywords: 'headache, nerve, memory' },
            { name: 'ENT', description: 'Ear, Nose, and Throat', keywords: 'ear, nose, throat, sinus' }
        ];
        const insertDept = db.prepare('INSERT INTO departments (name, description, keywords) VALUES (?, ?, ?)');
        const deptIds = {};
        for (const d of departments) {
            const result = insertDept.run(d.name, d.description, d.keywords);
            deptIds[d.name] = Number(result.lastInsertRowid);
        }
        // 2. Users & Profiles
        const insertUser = db.prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)');
        const insertPatient = db.prepare('INSERT INTO patient_profiles (user_id, full_name, date_of_birth, phone_number) VALUES (?, ?, ?, ?)');
        const insertDoctor = db.prepare('INSERT INTO doctor_profiles (user_id, full_name, department_id, specialization) VALUES (?, ?, ?, ?)');
        // Admin
        insertUser.run('Admin User', 'admin@hea.test', pwHash, 'ADMIN');
        // Patient
        const patientRes = insertUser.run('John Patient', 'patient@hea.test', pwHash, 'PATIENT');
        insertPatient.run(patientRes.lastInsertRowid, 'John Patient', '1985-05-15', '555-0100');
        // Doctors
        const doctors = [
            { name: 'Dr. Alice Smith', email: 'alice@hea.test', dept: 'General Medicine', spec: 'Internal Medicine' },
            { name: 'Dr. Bob Jones', email: 'bob@hea.test', dept: 'Cardiology', spec: 'Interventional Cardiology' },
            { name: 'Dr. Carol White', email: 'carol@hea.test', dept: 'Dermatology', spec: 'Cosmetic Dermatology' },
            { name: 'Dr. David Brown', email: 'david@hea.test', dept: 'Orthopedics', spec: 'Sports Medicine' },
            { name: 'Dr. Eve Davis', email: 'eve@hea.test', dept: 'Neurology', spec: 'Clinical Neurology' },
            { name: 'Dr. Frank Miller', email: 'frank@hea.test', dept: 'ENT', spec: 'Pediatric Otolaryngology' }
        ];
        const insertSlot = db.prepare('INSERT INTO time_slots (doctor_id, start_time, end_time, status) VALUES (?, ?, ?, ?)');
        const now = new Date();
        // Start from tomorrow, 9 AM
        const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 9, 0, 0);
        for (const doc of doctors) {
            const docUser = insertUser.run(doc.name, doc.email, pwHash, 'DOCTOR');
            const docProfile = insertDoctor.run(docUser.lastInsertRowid, doc.name, deptIds[doc.dept], doc.spec);
            const doctorId = Number(docProfile.lastInsertRowid);
            // Generate 14 days of availability, weekdays only, 9am to 11am (4 slots/day for brevity)
            for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
                const currentDate = new Date(startDate);
                currentDate.setDate(currentDate.getDate() + dayOffset);
                // Skip weekends
                if (currentDate.getDay() === 0 || currentDate.getDay() === 6)
                    continue;
                for (let slotHour = 9; slotHour < 11; slotHour++) {
                    for (let slotMin = 0; slotMin < 60; slotMin += 30) {
                        const slotStart = new Date(currentDate);
                        slotStart.setHours(slotHour, slotMin, 0, 0);
                        const slotEnd = new Date(slotStart);
                        slotEnd.setMinutes(slotStart.getMinutes() + 30);
                        insertSlot.run(doctorId, slotStart.toISOString(), slotEnd.toISOString(), 'AVAILABLE');
                    }
                }
            }
        }
    });
    seedTransaction();
    console.log('Database seeded successfully!');
    console.log('Demo Accounts (password: password123):');
    console.log(' - Admin: admin@hea.test');
    console.log(' - Patient: patient@hea.test');
    console.log(' - Doctor: alice@hea.test (General Medicine)');
    console.log(' - Doctor: bob@hea.test (Cardiology)');
}
seed().catch(console.error);
//# sourceMappingURL=seed.js.map