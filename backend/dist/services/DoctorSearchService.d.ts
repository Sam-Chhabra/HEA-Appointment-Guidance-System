export declare class DoctorSearchService {
    getDoctorsByDepartment(departmentId: number): import("../repositories/DoctorRepository.js").DoctorWithDepartment[];
    searchDoctors(departmentId: number, filters: {
        specialization?: string;
        availableFrom?: string;
        availableTo?: string;
    }): import("../repositories/DoctorRepository.js").DoctorWithDepartment[];
    getAvailableSlots(doctorId: number, from?: string, to?: string): import("../repositories/TimeSlotRepository.js").TimeSlotRow[];
}
export declare const doctorSearchService: DoctorSearchService;
