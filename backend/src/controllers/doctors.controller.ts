import { Request, Response, NextFunction } from 'express';
import { doctorSearchService } from '../services/DoctorSearchService.js';
import { doctorRepository } from '../repositories/DoctorRepository.js';

export class DoctorController {
  search(req: Request, res: Response, next: NextFunction) {
    try {
      const departmentId = parseInt(req.query.departmentId as string, 10);
      
      if (isNaN(departmentId)) {
        // Return all doctors if no department is specified
        const allDoctors = doctorRepository.findAll();
        res.json(allDoctors);
        return;
      }

      const filters = {
        specialization: req.query.specialization as string | undefined,
        availableFrom: req.query.availableFrom as string | undefined,
        availableTo: req.query.availableTo as string | undefined,
      };

      const doctors = doctorSearchService.searchDoctors(departmentId, filters);
      res.json(doctors);
    } catch (error) {
      next(error);
    }
  }

  getSlots(req: Request, res: Response, next: NextFunction) {
    try {
      const doctorId = parseInt(req.params.id as string, 10);
      const from = req.query.from as string | undefined;
      const to = req.query.to as string | undefined;

      const slots = doctorSearchService.getAvailableSlots(doctorId, from, to);
      res.json(slots);
    } catch (error) {
      next(error);
    }
  }
}

export const doctorController = new DoctorController();
