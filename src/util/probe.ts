import ping from 'ping';

export async function probe(address: string): Promise<boolean> {
	try {
		const pingResult = await ping.promise.probe(address);
		return pingResult.alive;
	} catch (e: unknown) {
		//console.log('probe error', address, e);
		return false;
	}
}
