import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';

let mockGetPDFDocument: Mock;
let mockReadFileAsArrayBuffer: Mock;
let mockDecryptPdfBytes: Mock;

vi.mock('@/js/utils/helpers.js', () => ({
  getPDFDocument: (...args: unknown[]) => mockGetPDFDocument(...args),
  readFileAsArrayBuffer: (...args: unknown[]) =>
    mockReadFileAsArrayBuffer(...args),
}));

vi.mock('@/js/utils/pdf-decrypt.js', () => ({
  decryptPdfBytes: (...args: unknown[]) => mockDecryptPdfBytes(...args),
}));

vi.mock('lucide', () => ({
  createIcons: vi.fn(),
  icons: {},
}));

vi.mock('pdfjs-dist', () => ({
  PasswordResponses: {
    NEED_PASSWORD: 1,
    INCORRECT_PASSWORD: 2,
  },
}));

function createMockFile(name: string, size = 100): File {
  const content = new Uint8Array(size);
  return new File([content], name, { type: 'application/pdf' });
}

interface MockLoadingTask {
  promise: Promise<{ destroy: () => Promise<void> }>;
  onPassword: ((callback: (pw: string) => void, reason: number) => void) | null;
  destroy: () => Promise<void>;
}

function mockDestroy() {
  return vi.fn().mockReturnValue(Promise.resolve());
}

function createNonEncryptedTask(): MockLoadingTask {
  const mockDoc = { destroy: mockDestroy() };
  const task: MockLoadingTask = {
    promise: Promise.resolve(mockDoc),
    onPassword: null,
    destroy: mockDestroy(),
  };
  return task;
}

function createEncryptedTask(): MockLoadingTask {
  let rejectFn: (err: unknown) => void;
  const task: MockLoadingTask = {
    promise: new Promise((_resolve, reject) => {
      rejectFn = reject;
    }),
    onPassword: null,
    destroy: mockDestroy(),
  };

  setTimeout(() => {
    if (task.onPassword) {
      task.onPassword(() => {}, 1);
    }
    rejectFn({ name: 'PasswordException', message: 'No password given' });
  }, 0);

  return task;
}

function createPasswordValidationTask(isValid: boolean): MockLoadingTask {
  if (isValid) {
    const mockDoc = { destroy: mockDestroy() };
    return {
      promise: Promise.resolve(mockDoc),
      onPassword: null,
      destroy: mockDestroy(),
    };
  }

  let rejectFn: (err: unknown) => void;
  const task: MockLoadingTask = {
    promise: new Promise((_resolve, reject) => {
      rejectFn = reject;
    }),
    onPassword: null,
    destroy: mockDestroy(),
  };

  setTimeout(() => {
    if (task.onPassword) {
      task.onPassword(() => {}, 2);
    }
    rejectFn({ name: 'PasswordException', message: 'Incorrect password' });
  }, 0);

  return task;
}

let batchDecryptIfNeeded: typeof import('@/js/utils/password-prompt').batchDecryptIfNeeded;
let loadPdfWithPasswordPrompt: typeof import('@/js/utils/password-prompt').loadPdfWithPasswordPrompt;
let handleEncryptedFiles: typeof import('@/js/utils/password-prompt').handleEncryptedFiles;
let promptAndDecryptFile: typeof import('@/js/utils/password-prompt').promptAndDecryptFile;

beforeEach(async () => {
  vi.resetModules();

  mockGetPDFDocument = vi.fn();
  mockReadFileAsArrayBuffer = vi.fn();
  mockDecryptPdfBytes = vi.fn();

  mockReadFileAsArrayBuffer.mockImplementation((file: File) => {
    return file.arrayBuffer();
  });

  const mod = await import('@/js/utils/password-prompt');
  batchDecryptIfNeeded = mod.batchDecryptIfNeeded;
  loadPdfWithPasswordPrompt = mod.loadPdfWithPasswordPrompt;
  handleEncryptedFiles = mod.handleEncryptedFiles;
  promptAndDecryptFile = mod.promptAndDecryptFile;
});

describe('batchDecryptIfNeeded', () => {
  it('should return empty array for empty input', async () => {
    const result = await batchDecryptIfNeeded([]);
    expect(result).toEqual([]);
  });

  it('should return same files when none are encrypted', async () => {
    mockGetPDFDocument.mockImplementation(() => createNonEncryptedTask());

    const files = [
      createMockFile('a.pdf'),
      createMockFile('b.pdf'),
      createMockFile('c.pdf'),
    ];

    const result = await batchDecryptIfNeeded(files);
    expect(result).toHaveLength(3);
    expect(result[0].name).toBe('a.pdf');
    expect(result[1].name).toBe('b.pdf');
    expect(result[2].name).toBe('c.pdf');
  });

  it('should return a new array copy when none are encrypted', async () => {
    mockGetPDFDocument.mockImplementation(() => createNonEncryptedTask());

    const files = [createMockFile('a.pdf')];
    const result = await batchDecryptIfNeeded(files);
    expect(result).not.toBe(files);
  });

  it('should detect encrypted files via getPDFDocument onPassword callback', async () => {
    const files = [createMockFile('encrypted.pdf')];

    mockGetPDFDocument.mockImplementation(() => createEncryptedTask());

    mockDecryptPdfBytes.mockResolvedValue({
      bytes: new Uint8Array([1, 2, 3]),
      engine: 'cpdf',
    });

    const modalPromise = batchDecryptIfNeeded(files);

    await vi.waitFor(() => {
      const modal = document.getElementById('password-modal');
      if (!modal || modal.classList.contains('hidden')) {
        throw new Error('Modal not visible yet');
      }
    });

    const input = document.getElementById(
      'password-modal-input'
    ) as HTMLInputElement;
    const submitBtn = document.getElementById(
      'password-modal-submit'
    ) as HTMLButtonElement;

    mockGetPDFDocument.mockImplementation(() =>
      createPasswordValidationTask(true)
    );

    input.value = 'secret';
    submitBtn.click();

    const result = await modalPromise;
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('encrypted.pdf');
  });

  it('should skip encrypted files when user cancels modal', async () => {
    const files = [createMockFile('encrypted.pdf')];

    mockGetPDFDocument.mockImplementation(() => createEncryptedTask());

    const modalPromise = batchDecryptIfNeeded(files);

    await vi.waitFor(() => {
      const modal = document.getElementById('password-modal');
      if (!modal || modal.classList.contains('hidden')) {
        throw new Error('Modal not visible yet');
      }
    });

    const cancelBtn = document.getElementById(
      'password-modal-cancel'
    ) as HTMLButtonElement;
    cancelBtn.click();

    const result = await modalPromise;
    expect(result).toHaveLength(0);
  });

  it('should pass through non-encrypted and skip cancelled encrypted files', async () => {
    const files = [createMockFile('plain.pdf'), createMockFile('locked.pdf')];

    let callCount = 0;
    mockGetPDFDocument.mockImplementation(() => {
      callCount++;
      if (callCount <= 1) return createNonEncryptedTask();
      if (callCount === 2) return createEncryptedTask();
      return createNonEncryptedTask();
    });

    const modalPromise = batchDecryptIfNeeded(files);

    await vi.waitFor(() => {
      const modal = document.getElementById('password-modal');
      if (!modal || modal.classList.contains('hidden')) {
        throw new Error('Modal not visible yet');
      }
    });

    const cancelBtn = document.getElementById(
      'password-modal-cancel'
    ) as HTMLButtonElement;
    cancelBtn.click();

    const result = await modalPromise;
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('plain.pdf');
  });

  it('should pass through non-encrypted and include decrypted files', async () => {
    const files = [createMockFile('plain.pdf'), createMockFile('locked.pdf')];

    let callCount = 0;
    mockGetPDFDocument.mockImplementation(() => {
      callCount++;
      if (callCount <= 1) return createNonEncryptedTask();
      if (callCount === 2) return createEncryptedTask();
      return createPasswordValidationTask(true);
    });

    mockDecryptPdfBytes.mockResolvedValue({
      bytes: new Uint8Array([10, 20, 30]),
      engine: 'cpdf',
    });

    const modalPromise = batchDecryptIfNeeded(files);

    await vi.waitFor(() => {
      const modal = document.getElementById('password-modal');
      if (!modal || modal.classList.contains('hidden')) {
        throw new Error('Modal not visible yet');
      }
    });

    const input = document.getElementById(
      'password-modal-input'
    ) as HTMLInputElement;
    const submitBtn = document.getElementById(
      'password-modal-submit'
    ) as HTMLButtonElement;
    input.value = 'pass123';
    submitBtn.click();

    const result = await modalPromise;
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('plain.pdf');
    expect(result[1].name).toBe('locked.pdf');
  });

  it('should handle single encrypted file via promptAndDecryptFile', async () => {
    const files = [createMockFile('single.pdf')];

    mockGetPDFDocument.mockImplementation(() => createEncryptedTask());

    mockDecryptPdfBytes.mockResolvedValue({
      bytes: new Uint8Array([5, 6, 7]),
      engine: 'cpdf',
    });

    const modalPromise = batchDecryptIfNeeded(files);

    await vi.waitFor(() => {
      const modal = document.getElementById('password-modal');
      if (!modal || modal.classList.contains('hidden')) {
        throw new Error('Modal not visible yet');
      }
    });

    mockGetPDFDocument.mockImplementation(() =>
      createPasswordValidationTask(true)
    );

    const input = document.getElementById(
      'password-modal-input'
    ) as HTMLInputElement;
    const submitBtn = document.getElementById(
      'password-modal-submit'
    ) as HTMLButtonElement;
    input.value = 'test';
    submitBtn.click();

    const result = await modalPromise;
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('single.pdf');
  });

  it('should handle file with 0 bytes', async () => {
    const files = [createMockFile('empty.pdf', 0)];

    mockGetPDFDocument.mockImplementation(() => createNonEncryptedTask());

    const result = await batchDecryptIfNeeded(files);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('empty.pdf');
  });

  it('should handle multiple files with same name', async () => {
    mockGetPDFDocument.mockImplementation(() => createNonEncryptedTask());

    const files = [
      createMockFile('report.pdf'),
      createMockFile('report.pdf'),
      createMockFile('report.pdf'),
    ];

    const result = await batchDecryptIfNeeded(files);
    expect(result).toHaveLength(3);
    expect(result[0].name).toBe('report.pdf');
    expect(result[1].name).toBe('report.pdf');
    expect(result[2].name).toBe('report.pdf');
  });

  it('should handle getPDFDocument rejecting with non-password error', async () => {
    const task: MockLoadingTask = {
      promise: Promise.reject(new Error('Corrupted PDF')),
      onPassword: null,
      destroy: mockDestroy(),
    };
    mockGetPDFDocument.mockImplementation(() => task);

    const files = [createMockFile('corrupt.pdf')];
    const result = await batchDecryptIfNeeded(files);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('corrupt.pdf');
  });
});

describe('batchDecryptIfNeeded with cached password', () => {
  it('should use cached password without showing modal', async () => {
    const files = [createMockFile('file1.pdf')];

    mockGetPDFDocument.mockImplementation(() => createEncryptedTask());
    mockDecryptPdfBytes.mockResolvedValue({
      bytes: new Uint8Array([1, 2, 3]),
      engine: 'cpdf',
    });

    const firstPromise = batchDecryptIfNeeded(files);

    await vi.waitFor(() => {
      const modal = document.getElementById('password-modal');
      if (!modal || modal.classList.contains('hidden')) {
        throw new Error('Modal not visible yet');
      }
    });

    mockGetPDFDocument.mockImplementation(() =>
      createPasswordValidationTask(true)
    );

    const input = document.getElementById(
      'password-modal-input'
    ) as HTMLInputElement;
    const submitBtn = document.getElementById(
      'password-modal-submit'
    ) as HTMLButtonElement;
    input.value = 'cached-pw';
    submitBtn.click();

    await firstPromise;

    const files2 = [createMockFile('file2.pdf')];

    let getPDFCallCount = 0;
    mockGetPDFDocument.mockImplementation(() => {
      getPDFCallCount++;
      if (getPDFCallCount === 1) return createEncryptedTask();
      return createPasswordValidationTask(true);
    });

    mockDecryptPdfBytes.mockResolvedValue({
      bytes: new Uint8Array([4, 5, 6]),
      engine: 'cpdf',
    });

    const result = await batchDecryptIfNeeded(files2);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('file2.pdf');

    const modal = document.getElementById('password-modal');
    expect(!modal || modal.classList.contains('hidden')).toBe(true);
  });

  it('should clear cache and show modal when cached password fails validation', async () => {
    const files = [createMockFile('first.pdf')];

    mockGetPDFDocument.mockImplementation(() => createEncryptedTask());
    mockDecryptPdfBytes.mockResolvedValue({
      bytes: new Uint8Array([1]),
      engine: 'cpdf',
    });

    const firstPromise = batchDecryptIfNeeded(files);

    await vi.waitFor(() => {
      const modal = document.getElementById('password-modal');
      if (!modal || modal.classList.contains('hidden')) {
        throw new Error('Modal not visible yet');
      }
    });

    mockGetPDFDocument.mockImplementation(() =>
      createPasswordValidationTask(true)
    );

    const input = document.getElementById(
      'password-modal-input'
    ) as HTMLInputElement;
    const submitBtn = document.getElementById(
      'password-modal-submit'
    ) as HTMLButtonElement;
    input.value = 'old-pw';
    submitBtn.click();

    await firstPromise;

    const files2 = [createMockFile('second.pdf')];

    let getPDFCallCount = 0;
    mockGetPDFDocument.mockImplementation(() => {
      getPDFCallCount++;
      if (getPDFCallCount === 1) return createEncryptedTask();
      if (getPDFCallCount === 2) return createPasswordValidationTask(false);
      return createPasswordValidationTask(true);
    });

    mockDecryptPdfBytes.mockResolvedValue({
      bytes: new Uint8Array([2]),
      engine: 'cpdf',
    });

    const secondPromise = batchDecryptIfNeeded(files2);

    await vi.waitFor(() => {
      const modal = document.getElementById('password-modal');
      if (!modal || modal.classList.contains('hidden')) {
        throw new Error('Modal not visible yet');
      }
    });

    const input2 = document.getElementById(
      'password-modal-input'
    ) as HTMLInputElement;
    const submitBtn2 = document.getElementById(
      'password-modal-submit'
    ) as HTMLButtonElement;

    mockGetPDFDocument.mockImplementation(() =>
      createPasswordValidationTask(true)
    );

    input2.value = 'new-pw';
    submitBtn2.click();

    const result = await secondPromise;
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('second.pdf');
  });
});

describe('batchDecryptIfNeeded with batch modal (multiple encrypted)', () => {
  it('should show batch modal for multiple encrypted files', async () => {
    const files = [createMockFile('enc1.pdf'), createMockFile('enc2.pdf')];

    mockGetPDFDocument.mockImplementation(() => createEncryptedTask());

    mockDecryptPdfBytes.mockResolvedValue({
      bytes: new Uint8Array([1, 2]),
      engine: 'cpdf',
    });

    const modalPromise = batchDecryptIfNeeded(files);

    await vi.waitFor(() => {
      const modal = document.getElementById('password-batch-modal');
      if (!modal || modal.classList.contains('hidden')) {
        throw new Error('Batch modal not visible yet');
      }
    });

    mockGetPDFDocument.mockImplementation(() =>
      createPasswordValidationTask(true)
    );

    const sharedInput = document.getElementById(
      'batch-modal-shared-input'
    ) as HTMLInputElement;
    const submitBtn = document.getElementById(
      'batch-modal-submit'
    ) as HTMLButtonElement;
    sharedInput.value = 'shared-pw';
    submitBtn.click();

    const result = await modalPromise;
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('enc1.pdf');
    expect(result[1].name).toBe('enc2.pdf');
  });

  it('should skip all encrypted files when user cancels batch modal', async () => {
    const files = [
      createMockFile('plain.pdf'),
      createMockFile('enc1.pdf'),
      createMockFile('enc2.pdf'),
    ];

    let callCount = 0;
    mockGetPDFDocument.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return createNonEncryptedTask();
      return createEncryptedTask();
    });

    const modalPromise = batchDecryptIfNeeded(files);

    await vi.waitFor(() => {
      const modal = document.getElementById('password-batch-modal');
      if (!modal || modal.classList.contains('hidden')) {
        throw new Error('Batch modal not visible yet');
      }
    });

    const cancelBtn = document.getElementById(
      'batch-modal-cancel'
    ) as HTMLButtonElement;
    cancelBtn.click();

    const result = await modalPromise;
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('plain.pdf');
  });

  it('should use cached password for multiple encrypted files without showing modal', async () => {
    const files1 = [createMockFile('setup.pdf')];

    mockGetPDFDocument.mockImplementation(() => createEncryptedTask());
    mockDecryptPdfBytes.mockResolvedValue({
      bytes: new Uint8Array([1]),
      engine: 'cpdf',
    });

    const firstPromise = batchDecryptIfNeeded(files1);

    await vi.waitFor(() => {
      const modal = document.getElementById('password-modal');
      if (!modal || modal.classList.contains('hidden')) {
        throw new Error('Modal not visible yet');
      }
    });

    mockGetPDFDocument.mockImplementation(() =>
      createPasswordValidationTask(true)
    );

    const input = document.getElementById(
      'password-modal-input'
    ) as HTMLInputElement;
    const submitBtn = document.getElementById(
      'password-modal-submit'
    ) as HTMLButtonElement;
    input.value = 'shared-secret';
    submitBtn.click();

    await firstPromise;

    const files2 = [createMockFile('enc-a.pdf'), createMockFile('enc-b.pdf')];

    let callIdx = 0;
    mockGetPDFDocument.mockImplementation(() => {
      callIdx++;
      if (callIdx <= 2) return createEncryptedTask();
      return createPasswordValidationTask(true);
    });

    mockDecryptPdfBytes.mockResolvedValue({
      bytes: new Uint8Array([10]),
      engine: 'cpdf',
    });

    const result = await batchDecryptIfNeeded(files2);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('enc-a.pdf');
    expect(result[1].name).toBe('enc-b.pdf');
  });
});

describe('loadPdfWithPasswordPrompt', () => {
  it('should return pdf, bytes, and file for non-encrypted file', async () => {
    const file = createMockFile('test.pdf', 50);
    const mockDoc = { destroy: vi.fn() };

    mockGetPDFDocument.mockImplementation(() => ({
      promise: Promise.resolve(mockDoc),
      onPassword: null,
      destroy: mockDestroy(),
    }));

    const result = await loadPdfWithPasswordPrompt(file);
    expect(result).not.toBeNull();
    expect(result!.pdf).toBe(mockDoc);
    expect(result!.file).toBe(file);
    expect(result!.bytes).toBeInstanceOf(ArrayBuffer);
  });

  it('should prompt for encrypted file and return decrypted result', async () => {
    const file = createMockFile('locked.pdf', 50);

    let firstCall = true;
    mockGetPDFDocument.mockImplementation(() => {
      if (firstCall) {
        firstCall = false;
        const err = new Error('Password required');
        (err as { name: string }).name = 'PasswordException';
        return {
          promise: Promise.reject(err),
          onPassword: null,
          destroy: mockDestroy(),
        };
      }
      return createNonEncryptedTask();
    });

    mockDecryptPdfBytes.mockResolvedValue({
      bytes: new Uint8Array([1, 2, 3]),
      engine: 'cpdf',
    });

    const resultPromise = loadPdfWithPasswordPrompt(file);

    await vi.waitFor(() => {
      const modal = document.getElementById('password-modal');
      if (!modal || modal.classList.contains('hidden')) {
        throw new Error('Modal not visible yet');
      }
    });

    mockGetPDFDocument.mockImplementation(() =>
      createPasswordValidationTask(true)
    );

    const input = document.getElementById(
      'password-modal-input'
    ) as HTMLInputElement;
    const submitBtn = document.getElementById(
      'password-modal-submit'
    ) as HTMLButtonElement;
    input.value = 'unlock';

    mockGetPDFDocument.mockImplementation(() => createNonEncryptedTask());

    submitBtn.click();

    const result = await resultPromise;
    expect(result).not.toBeNull();
    expect(result!.file.name).toBe('locked.pdf');
  });

  it('should return null when user skips encrypted file', async () => {
    const file = createMockFile('locked.pdf', 50);

    mockGetPDFDocument.mockImplementation(() => {
      const err = new Error('Password required');
      (err as { name: string }).name = 'PasswordException';
      return {
        promise: Promise.reject(err),
        onPassword: null,
        destroy: mockDestroy(),
      };
    });

    const resultPromise = loadPdfWithPasswordPrompt(file);

    await vi.waitFor(() => {
      const modal = document.getElementById('password-modal');
      if (!modal || modal.classList.contains('hidden')) {
        throw new Error('Modal not visible yet');
      }
    });

    const cancelBtn = document.getElementById(
      'password-modal-cancel'
    ) as HTMLButtonElement;
    cancelBtn.click();

    const result = await resultPromise;
    expect(result).toBeNull();
  });

  it('should rethrow non-password errors', async () => {
    const file = createMockFile('bad.pdf', 50);

    mockGetPDFDocument.mockImplementation(() => ({
      promise: Promise.reject(new Error('Corrupted file')),
      onPassword: null,
      destroy: mockDestroy(),
    }));

    await expect(loadPdfWithPasswordPrompt(file)).rejects.toThrow(
      'Corrupted file'
    );
  });

  it('should update files array and index when provided', async () => {
    const file = createMockFile('locked.pdf', 50);
    const filesArr = [createMockFile('other.pdf'), file];

    let firstCall = true;
    mockGetPDFDocument.mockImplementation(() => {
      if (firstCall) {
        firstCall = false;
        const err = new Error('Password required');
        (err as { name: string }).name = 'PasswordException';
        return {
          promise: Promise.reject(err),
          onPassword: null,
          destroy: mockDestroy(),
        };
      }
      return createNonEncryptedTask();
    });

    mockDecryptPdfBytes.mockResolvedValue({
      bytes: new Uint8Array([7, 8, 9]),
      engine: 'cpdf',
    });

    const resultPromise = loadPdfWithPasswordPrompt(file, filesArr, 1);

    await vi.waitFor(() => {
      const modal = document.getElementById('password-modal');
      if (!modal || modal.classList.contains('hidden')) {
        throw new Error('Modal not visible yet');
      }
    });

    mockGetPDFDocument.mockImplementation(() =>
      createPasswordValidationTask(true)
    );

    const input = document.getElementById(
      'password-modal-input'
    ) as HTMLInputElement;
    const submitBtn = document.getElementById(
      'password-modal-submit'
    ) as HTMLButtonElement;
    input.value = 'pw';

    mockGetPDFDocument.mockImplementation(() => createNonEncryptedTask());

    submitBtn.click();

    const result = await resultPromise;
    expect(result).not.toBeNull();
    expect(filesArr[1].name).toBe('locked.pdf');
    expect(filesArr[1]).not.toBe(file);
  });
});

describe('promptAndDecryptFile', () => {
  it('should show modal and decrypt file on valid password', async () => {
    const file = createMockFile('test.pdf', 50);

    mockGetPDFDocument.mockImplementation(() =>
      createPasswordValidationTask(true)
    );
    mockDecryptPdfBytes.mockResolvedValue({
      bytes: new Uint8Array([1, 2, 3]),
      engine: 'cpdf',
    });

    const resultPromise = promptAndDecryptFile(file);

    await vi.waitFor(() => {
      const modal = document.getElementById('password-modal');
      if (!modal || modal.classList.contains('hidden')) {
        throw new Error('Modal not visible yet');
      }
    });

    const input = document.getElementById(
      'password-modal-input'
    ) as HTMLInputElement;
    const submitBtn = document.getElementById(
      'password-modal-submit'
    ) as HTMLButtonElement;
    input.value = 'correct';
    submitBtn.click();

    const result = await resultPromise;
    expect(result).not.toBeNull();
    expect(result!.name).toBe('test.pdf');
    expect(result!.type).toBe('application/pdf');
  });

  it('should return null when user clicks cancel', async () => {
    const file = createMockFile('test.pdf');

    const resultPromise = promptAndDecryptFile(file);

    await vi.waitFor(() => {
      const modal = document.getElementById('password-modal');
      if (!modal || modal.classList.contains('hidden')) {
        throw new Error('Modal not visible yet');
      }
    });

    const cancelBtn = document.getElementById(
      'password-modal-cancel'
    ) as HTMLButtonElement;
    cancelBtn.click();

    const result = await resultPromise;
    expect(result).toBeNull();
  });

  it('should show error when submitting empty password', async () => {
    const file = createMockFile('test.pdf');

    promptAndDecryptFile(file);

    await vi.waitFor(() => {
      const modal = document.getElementById('password-modal');
      if (!modal || modal.classList.contains('hidden')) {
        throw new Error('Modal not visible yet');
      }
    });

    const input = document.getElementById(
      'password-modal-input'
    ) as HTMLInputElement;
    const submitBtn = document.getElementById(
      'password-modal-submit'
    ) as HTMLButtonElement;
    const errorEl = document.getElementById(
      'password-modal-error'
    ) as HTMLParagraphElement;

    input.value = '';
    submitBtn.click();

    expect(errorEl.textContent).toBe('Please enter a password');
    expect(errorEl.classList.contains('hidden')).toBe(false);

    const cancelBtn = document.getElementById(
      'password-modal-cancel'
    ) as HTMLButtonElement;
    cancelBtn.click();
  });

  it('should show error for incorrect password and allow retry', async () => {
    const file = createMockFile('test.pdf');

    let callCount = 0;
    mockGetPDFDocument.mockImplementation(() => {
      callCount++;
      if (callCount <= 1) return createPasswordValidationTask(false);
      return createPasswordValidationTask(true);
    });

    mockDecryptPdfBytes.mockResolvedValue({
      bytes: new Uint8Array([1]),
      engine: 'cpdf',
    });

    const resultPromise = promptAndDecryptFile(file);

    await vi.waitFor(() => {
      const modal = document.getElementById('password-modal');
      if (!modal || modal.classList.contains('hidden')) {
        throw new Error('Modal not visible yet');
      }
    });

    const input = document.getElementById(
      'password-modal-input'
    ) as HTMLInputElement;
    const submitBtn = document.getElementById(
      'password-modal-submit'
    ) as HTMLButtonElement;

    input.value = 'wrong';
    submitBtn.click();

    await vi.waitFor(() => {
      const errorEl = document.getElementById('password-modal-error');
      if (!errorEl || errorEl.classList.contains('hidden')) {
        throw new Error('Error not visible yet');
      }
    });

    const errorEl = document.getElementById(
      'password-modal-error'
    ) as HTMLParagraphElement;
    expect(errorEl.textContent).toBe('Incorrect password. Please try again.');

    input.value = 'correct';
    submitBtn.click();

    const result = await resultPromise;
    expect(result).not.toBeNull();
    expect(result!.name).toBe('test.pdf');
  });

  it('should handle decryptPdfBytes throwing error', async () => {
    const file = createMockFile('test.pdf');

    mockGetPDFDocument.mockImplementation(() =>
      createPasswordValidationTask(true)
    );
    mockDecryptPdfBytes.mockRejectedValue(new Error('Decryption failed'));

    const resultPromise = promptAndDecryptFile(file);

    await vi.waitFor(() => {
      const modal = document.getElementById('password-modal');
      if (!modal || modal.classList.contains('hidden')) {
        throw new Error('Modal not visible yet');
      }
    });

    const input = document.getElementById(
      'password-modal-input'
    ) as HTMLInputElement;
    const submitBtn = document.getElementById(
      'password-modal-submit'
    ) as HTMLButtonElement;
    input.value = 'pass';
    submitBtn.click();

    await vi.waitFor(() => {
      const errorEl = document.getElementById('password-modal-error');
      if (!errorEl || errorEl.classList.contains('hidden')) {
        throw new Error('Error not visible yet');
      }
    });

    const errorEl = document.getElementById(
      'password-modal-error'
    ) as HTMLParagraphElement;
    expect(errorEl.textContent).toBe(
      'Failed to decrypt. Try the Decrypt tool instead.'
    );

    const cancelBtn = document.getElementById(
      'password-modal-cancel'
    ) as HTMLButtonElement;
    cancelBtn.click();

    const result = await resultPromise;
    expect(result).toBeNull();
  });

  it('should use cached password without showing modal', async () => {
    const file1 = createMockFile('first.pdf');

    mockGetPDFDocument.mockImplementation(() =>
      createPasswordValidationTask(true)
    );
    mockDecryptPdfBytes.mockResolvedValue({
      bytes: new Uint8Array([1]),
      engine: 'cpdf',
    });

    const firstPromise = promptAndDecryptFile(file1);

    await vi.waitFor(() => {
      const modal = document.getElementById('password-modal');
      if (!modal || modal.classList.contains('hidden')) {
        throw new Error('Modal not visible yet');
      }
    });

    const input = document.getElementById(
      'password-modal-input'
    ) as HTMLInputElement;
    const submitBtn = document.getElementById(
      'password-modal-submit'
    ) as HTMLButtonElement;
    input.value = 'reuse-me';
    submitBtn.click();

    await firstPromise;

    const file2 = createMockFile('second.pdf');

    mockGetPDFDocument.mockImplementation(() =>
      createPasswordValidationTask(true)
    );
    mockDecryptPdfBytes.mockResolvedValue({
      bytes: new Uint8Array([2]),
      engine: 'cpdf',
    });

    const result = await promptAndDecryptFile(file2);
    expect(result).not.toBeNull();
    expect(result!.name).toBe('second.pdf');
  });

  it('should clear cache and show modal when cached password is invalid', async () => {
    const file1 = createMockFile('first.pdf');

    mockGetPDFDocument.mockImplementation(() =>
      createPasswordValidationTask(true)
    );
    mockDecryptPdfBytes.mockResolvedValue({
      bytes: new Uint8Array([1]),
      engine: 'cpdf',
    });

    const firstPromise = promptAndDecryptFile(file1);

    await vi.waitFor(() => {
      const modal = document.getElementById('password-modal');
      if (!modal || modal.classList.contains('hidden')) {
        throw new Error('Modal not visible yet');
      }
    });

    const input = document.getElementById(
      'password-modal-input'
    ) as HTMLInputElement;
    const submitBtn = document.getElementById(
      'password-modal-submit'
    ) as HTMLButtonElement;
    input.value = 'old-pass';
    submitBtn.click();

    await firstPromise;

    const file2 = createMockFile('second.pdf');

    let validationCallCount = 0;
    mockGetPDFDocument.mockImplementation(() => {
      validationCallCount++;
      if (validationCallCount === 1) return createPasswordValidationTask(false);
      return createPasswordValidationTask(true);
    });

    mockDecryptPdfBytes.mockResolvedValue({
      bytes: new Uint8Array([2]),
      engine: 'cpdf',
    });

    const secondPromise = promptAndDecryptFile(file2);

    await vi.waitFor(() => {
      const modal = document.getElementById('password-modal');
      if (!modal || modal.classList.contains('hidden')) {
        throw new Error('Modal not visible yet');
      }
    });

    const input2 = document.getElementById(
      'password-modal-input'
    ) as HTMLInputElement;
    const submitBtn2 = document.getElementById(
      'password-modal-submit'
    ) as HTMLButtonElement;
    input2.value = 'new-pass';
    submitBtn2.click();

    const result = await secondPromise;
    expect(result).not.toBeNull();
    expect(result!.name).toBe('second.pdf');
  });

  it('should clear cache when decryptPdfBytes throws with cached password', async () => {
    const file1 = createMockFile('first.pdf');

    mockGetPDFDocument.mockImplementation(() =>
      createPasswordValidationTask(true)
    );
    mockDecryptPdfBytes.mockResolvedValueOnce({
      bytes: new Uint8Array([1]),
      engine: 'cpdf',
    });

    const firstPromise = promptAndDecryptFile(file1);

    await vi.waitFor(() => {
      const modal = document.getElementById('password-modal');
      if (!modal || modal.classList.contains('hidden')) {
        throw new Error('Modal not visible yet');
      }
    });

    const input = document.getElementById(
      'password-modal-input'
    ) as HTMLInputElement;
    const submitBtn = document.getElementById(
      'password-modal-submit'
    ) as HTMLButtonElement;
    input.value = 'will-fail-later';
    submitBtn.click();

    await firstPromise;

    const file2 = createMockFile('second.pdf');

    mockGetPDFDocument.mockImplementation(() =>
      createPasswordValidationTask(true)
    );
    mockDecryptPdfBytes.mockRejectedValueOnce(new Error('Decrypt fail'));
    mockDecryptPdfBytes.mockResolvedValueOnce({
      bytes: new Uint8Array([2]),
      engine: 'cpdf',
    });

    const secondPromise = promptAndDecryptFile(file2);

    await vi.waitFor(() => {
      const modal = document.getElementById('password-modal');
      if (!modal || modal.classList.contains('hidden')) {
        throw new Error('Modal not visible yet');
      }
    });

    const input2 = document.getElementById(
      'password-modal-input'
    ) as HTMLInputElement;
    const submitBtn2 = document.getElementById(
      'password-modal-submit'
    ) as HTMLButtonElement;
    input2.value = 'new-pw';
    submitBtn2.click();

    const result = await secondPromise;
    expect(result).not.toBeNull();
    expect(result!.name).toBe('second.pdf');
  });
});

describe('handleEncryptedFiles', () => {
  it('should return empty map when no encrypted indices', async () => {
    const files = [createMockFile('a.pdf')];
    const result = await handleEncryptedFiles(files, []);
    expect(result.size).toBe(0);
  });

  it('should delegate to promptAndDecryptBatch for single encrypted file', async () => {
    const files = [createMockFile('enc.pdf')];

    mockGetPDFDocument.mockImplementation(() =>
      createPasswordValidationTask(true)
    );
    mockDecryptPdfBytes.mockResolvedValue({
      bytes: new Uint8Array([1]),
      engine: 'cpdf',
    });

    const resultPromise = handleEncryptedFiles(files, [0]);

    await vi.waitFor(() => {
      const modal = document.getElementById('password-modal');
      if (!modal || modal.classList.contains('hidden')) {
        throw new Error('Modal not visible yet');
      }
    });

    const input = document.getElementById(
      'password-modal-input'
    ) as HTMLInputElement;
    const submitBtn = document.getElementById(
      'password-modal-submit'
    ) as HTMLButtonElement;
    input.value = 'pass';
    submitBtn.click();

    const result = await resultPromise;
    expect(result.size).toBe(1);
    expect(result.has(0)).toBe(true);
    expect(result.get(0)!.name).toBe('enc.pdf');
  });

  it('should delegate to promptAndDecryptBatch for multiple encrypted files', async () => {
    const files = [
      createMockFile('plain.pdf'),
      createMockFile('enc1.pdf'),
      createMockFile('enc2.pdf'),
    ];

    mockGetPDFDocument.mockImplementation(() =>
      createPasswordValidationTask(true)
    );
    mockDecryptPdfBytes.mockResolvedValue({
      bytes: new Uint8Array([1]),
      engine: 'cpdf',
    });

    const resultPromise = handleEncryptedFiles(files, [1, 2]);

    await vi.waitFor(() => {
      const modal = document.getElementById('password-batch-modal');
      if (!modal || modal.classList.contains('hidden')) {
        throw new Error('Batch modal not visible yet');
      }
    });

    const sharedInput = document.getElementById(
      'batch-modal-shared-input'
    ) as HTMLInputElement;
    const submitBtn = document.getElementById(
      'batch-modal-submit'
    ) as HTMLButtonElement;
    sharedInput.value = 'shared';
    submitBtn.click();

    const result = await resultPromise;
    expect(result.size).toBe(2);
    expect(result.has(1)).toBe(true);
    expect(result.has(2)).toBe(true);
  });

  it('should return empty map when user skips all files', async () => {
    const files = [createMockFile('enc.pdf')];

    const resultPromise = handleEncryptedFiles(files, [0]);

    await vi.waitFor(() => {
      const modal = document.getElementById('password-modal');
      if (!modal || modal.classList.contains('hidden')) {
        throw new Error('Modal not visible yet');
      }
    });

    const cancelBtn = document.getElementById(
      'password-modal-cancel'
    ) as HTMLButtonElement;
    cancelBtn.click();

    const result = await resultPromise;
    expect(result.size).toBe(0);
  });
});
