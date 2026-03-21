export interface AttachmentInfo {
    index: number;
    name: string;
    page: number;
    data: Uint8Array;
}

export interface EditAttachmentState {
    file: File | null;
    allAttachments: AttachmentInfo[];
    attachmentsToRemove: Set<number>;
}