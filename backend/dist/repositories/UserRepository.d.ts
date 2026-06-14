export interface UserRow {
    id: number;
    name: string;
    email: string;
    password_hash: string;
    role: string;
    created_at: string;
    updated_at: string;
}
export declare class UserRepository {
    findByEmail(email: string): UserRow | undefined;
    findById(id: number): UserRow | undefined;
    create(name: string, email: string, passwordHash: string, role: string): UserRow;
}
export declare const userRepository: UserRepository;
