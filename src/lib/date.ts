export function formatDuration(duration: number): string {
    const hour = Math.floor(duration / 3600);
    const minute = Math.floor((duration % 3600) / 60);
    const paddedHour = hour.toString().padStart(2, "0")
    const paddedMinute = minute.toString().padStart(2, "0")
    return `${paddedHour}:${paddedMinute}`;
}