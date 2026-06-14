export interface DepartmentRow {
    id: number;
    name: string;
    description: string | null;
    keywords: string | null;
}
export declare class DepartmentRepository {
    findAll(): DepartmentRow[];
    findById(id: number): DepartmentRow | undefined;
    findByName(name: string): DepartmentRow | undefined;
}
export declare const departmentRepository: DepartmentRepository;
