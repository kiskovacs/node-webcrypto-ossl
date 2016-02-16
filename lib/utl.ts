export function createUint8Array(buf: Buffer) {
    const result = new Uint8Array(buf.length);
    for (let i = 0; i < buf.length; i++) result[i] = buf[i];
    return result;
}