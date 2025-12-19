// Rotation state management for PDF pages
const rotationState: number[] = [];

export function getRotationState(): readonly number[] {
    return rotationState;
}

export function updateRotationState(pageIndex: number, rotation: number) {
    if (pageIndex >= 0 && pageIndex < rotationState.length) {
        rotationState[pageIndex] = rotation;
    }
}

export function resetRotationState() {
    rotationState.length = 0;
}

export function initializeRotationState(pageCount: number) {
    rotationState.length = 0;
    for (let i = 0; i < pageCount; i++) {
        rotationState.push(0);
    }
}
