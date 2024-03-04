export type Task = {
    id: number,
    title: string,
    scheduled: Date | null,
    duration: number,
    deadline: Date,
    repeat: number | null
    startAfter: Date,
};