import {encrypt, decrypt} from '../src/server/util/encryption';

it('encrypt', () => {
	const encryptionKey = 'encryptionKey';
	const someData = 'some data';

	const encrypted = encrypt(Buffer.from(someData), encryptionKey);
	const decrypted = decrypt(encrypted, encryptionKey);

	expect(decrypted.toString()).toBe(someData);
});
