export declare function hashPassword(plaintext: string): Promise<string>;
export declare function comparePassword(plaintext: string, hash: string): Promise<boolean>;
