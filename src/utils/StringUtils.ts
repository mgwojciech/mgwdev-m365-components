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