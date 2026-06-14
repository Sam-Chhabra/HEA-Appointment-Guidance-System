export interface GuidanceSessionRow {
    id: number;
    patient_id: number | null;
    input_text: string;
    extracted_keywords: string | null;
    recommended_department_id: number | null;
    selected_department_id: number | null;
    status: string;
    created_at: string;
    updated_at: string;
}
export interface GuidanceSessionWithDepartment extends GuidanceSessionRow {
    recommended_department_name: string | null;
    selected_department_name: string | null;
}
export declare class GuidanceRepository {
    findById(id: number): GuidanceSessionWithDepartment | undefined;
    create(patientId: number | null, inputText: string, extractedKeywords: string | null, recommendedDepartmentId: number | null, selectedDepartmentId: number | null): GuidanceSessionRow;
    updateSelectedDepartment(id: number, departmentId: number): void;
    updateStatus(id: number, status: string): void;
}
export declare const guidanceRepository: GuidanceRepository;
