import crypto from 'crypto';

const algorithm = 'aes-256-ctr';

export function encrypt(buffer: Buffer, encryptionKey: string): Buffer {
	const key = crypto.createHash('sha256').update(String(encryptionKey)).digest('base64').substr(0, 32);

	// Create an initialization vector
	const iv = crypto.randomBytes(16);

	// Create a new cipher using the algorithm, key, and iv
	const cipher = crypto.createCipheriv(algorithm, key, iv);

	// Create the new (encrypted) buffer
	const result = Buffer.concat([iv, cipher.update(buffer), cipher.final()]);

	return result;
}

export const decrypt = (buffer: Buffer, encryptionKey: string): Buffer => {
	const key = crypto.createHash('sha256').update(String(encryptionKey)).digest('base64').substr(0, 32);

	// Get the iv: the first 16 bytes
	const iv = buffer.slice(0, 16);

	// Get the rest
	const rest = buffer.slice(16);

	// Create a decipher
	const decipher = crypto.createDecipheriv(algorithm, key, iv);

	// Actually decrypt it
	const result = Buffer.concat([decipher.update(rest), decipher.final()]);

	return result;
};
