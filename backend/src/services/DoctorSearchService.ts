import { doctorRepository } from '../repositories/DoctorRepository.js';
import { timeSlotRepository } from '../repositories/TimeSlotRepository.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

export class DoctorSearchService {
  getDoctorsByDepartment(departmentId: number) {
    return doctorRepository.findByDepartment(departmentId);
  }

  searchDoctors(departmentId: number, filters: {
    specialization?: string;
    availableFrom?: string;
    availableTo?: string;
  }) {
    if (filters.specialization && (filters.availableFrom || filters.availableTo)) {
      // Both specialization and availability filter
      const specDoctors = doctorRepository.findByDepartmentAndSpecialization(
        departmentId, filters.specialization
      );

      if (filters.availableFrom && filters.availableTo) {
        const availDoctors = doctorRepository.findWithAvailability(
          departmentId, filters.availableFrom, filters.availableTo
        );
        const availIds = new Set(availDoctors.map((d) => d.id));
        return specDoctors.filter((d) => availIds.has(d.id));
      }

      return specDoctors;
    }

    if (filters.specialization) {
      return doctorRepository.findByDepartmentAndSpecialization(
        departmentId, filters.specialization
      );
    }

    if (filters.availableFrom && filters.availableTo) {
      return doctorRepository.findWithAvailability(
        departmentId, filters.availableFrom, filters.availableTo
      );
    }

    return doctorRepository.findByDepartment(departmentId);
  }

  getAvailableSlots(doctorId: number, from?: string, to?: string) {
    const doctor = doctorRepository.findById(doctorId);
    if (!doctor) {
      throw new NotFoundError('Doctor not found.');
    }

    return timeSlotRepository.findAvailableByDoctor(doctorId, from, to);
  }
}

export const doctorSearchService = new DoctorSearchService();
