export interface DoctorProfileRow {
    id: number;
    user_id: number;
    full_name: string;
    department_id: number;
    specialization: string | null;
    created_at: string;
    updated_at: string;
}
export interface DoctorWithDepartment extends DoctorProfileRow {
    department_name: string;
}
export declare class DoctorRepository {
    findById(id: number): DoctorProfileRow | undefined;
    findByUserId(userId: number): DoctorProfileRow | undefined;
    findByDepartment(departmentId: number): DoctorWithDepartment[];
    findByDepartmentAndSpecialization(departmentId: number, specialization: string): DoctorWithDepartment[];
    findWithAvailability(departmentId: number, from: string, to: string): DoctorWithDepartment[];
    findAll(): DoctorWithDepartment[];
}
export declare const doctorRepository: DoctorRepository;
