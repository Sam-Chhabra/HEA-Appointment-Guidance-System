export declare class GuidanceService {
    submitGuidanceInput(inputText: string, patientId: number | null): {
        isEmergency: boolean;
        message: string;
        disclaimer: string;
        sessionId?: undefined;
        recommendedDepartment?: undefined;
        explanation?: undefined;
        extractedKeywords?: undefined;
        alternatives?: undefined;
    } | {
        isEmergency: boolean;
        sessionId: number;
        recommendedDepartment: {
            id: number;
            name: string;
        } | null;
        explanation: string;
        extractedKeywords: string[];
        alternatives: {
            id: number;
            name: string;
        }[];
        disclaimer: string;
        message?: undefined;
    };
    extractKeywords(inputText: string): string[];
    recommendDepartment(keywords: string[]): {
        departmentId: number | null;
        department: {
            id: number;
            name: string;
        } | null;
        explanation: string;
        alternatives: {
            id: number;
            name: string;
        }[];
    };
    overrideDepartment(sessionId: number, departmentId: number, patientId: number): {
        sessionId: number;
        selectedDepartment: {
            id: number;
            name: string;
        };
        disclaimer: string;
    };
    getGuidanceSession(sessionId: number, patientId: number): {
        disclaimer: string;
        recommended_department_name: string | null;
        selected_department_name: string | null;
        id: number;
        patient_id: number | null;
        input_text: string;
        extracted_keywords: string | null;
        recommended_department_id: number | null;
        selected_department_id: number | null;
        status: string;
        created_at: string;
        updated_at: string;
    };
}
export declare const guidanceService: GuidanceService;
