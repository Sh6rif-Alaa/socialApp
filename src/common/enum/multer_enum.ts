export const FileType: Record<string, string[]> = {
    image: ['image/jpeg', 'image/png', 'image/jpg'],
    video: ['video/mp4'],
    pdf: ['application/pdf'],
}

export enum StorageEnum {
    disk = 'disk',
    memory = 'memory',
}

export enum ObjectControl {
    public = 'public',
    private = 'private',
}
