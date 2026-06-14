import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorMiddleware } from './middleware/errorMiddleware.js';
import { authRoutes } from './routes/auth.routes.js';
import { guidanceRoutes } from './routes/guidance.routes.js';
import { departmentRoutes } from './routes/departments.routes.js';
import { doctorRoutes } from './routes/doctors.routes.js';
import { appointmentRoutes } from './routes/appointments.routes.js';
import { adminAvailabilityRoutes } from './routes/adminAvailability.routes.js';
import { doctorScheduleRoutes } from './routes/doctorSchedule.routes.js';
import { notificationRoutes } from './routes/notifications.routes.js';

export function createApp() {
  const app = express();

  // --- Middleware ---
  app.use(cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001'
    ],
    credentials: true,
  }));
  app.use(express.json());
  app.use(cookieParser());

  // --- Health check ---
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // --- Routes ---
  app.use('/api/auth', authRoutes);
  app.use('/api/guidance', guidanceRoutes);
  app.use('/api/departments', departmentRoutes);
  app.use('/api/doctors', doctorRoutes);
  app.use('/api/appointments', appointmentRoutes);
  app.use('/api/admin', adminAvailabilityRoutes);
  app.use('/api/doctor', doctorScheduleRoutes);
  app.use('/api/notifications', notificationRoutes);

  // --- Global error handler (must be last) ---
  app.use(errorMiddleware);

  return app;
}
