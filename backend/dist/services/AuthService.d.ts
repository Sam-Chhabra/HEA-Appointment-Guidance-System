export declare class AuthService {
    registerPatient(name: string, email: string, password: string): Promise<{
        user: {
            id: number;
            name: string;
            email: string;
            role: string;
        };
        token: string;
    }>;
    login(email: string, password: string): Promise<{
        user: {
            id: number;
            name: string;
            email: string;
            role: string;
        };
        token: string;
    }>;
    getCurrentUser(userId: number): {
        id: number;
        name: string;
        email: string;
        role: string;
    };
}
export declare const authService: AuthService;
