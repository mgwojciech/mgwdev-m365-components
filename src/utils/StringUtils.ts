export function camelCase(value: string): string {
    return value
        .replace(/-(.)/g, function (a) {
            return a[1].toUpperCase();
        })
        .replace(/-/g, '')
        .replace(/^(.)/, function (b) {
            return b.toLowerCase();
        });
}
export function simpleHash(val: string) {
    let hash = 0;
    for (let i = 0; i < val.length; i++) {
        const char = val.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0; // Convert to 32-bit integer
    }
    return hash;
}