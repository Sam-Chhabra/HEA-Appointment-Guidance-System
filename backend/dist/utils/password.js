import bcrypt from 'bcrypt';
const SALT_ROUNDS = 10;
export async function hashPassword(plaintext) {
    return bcrypt.hash(plaintext, SALT_ROUNDS);
}
export async function comparePassword(plaintext, hash) {
    return bcrypt.compare(plaintext, hash);
}
//# sourceMappingURL=password.js.map