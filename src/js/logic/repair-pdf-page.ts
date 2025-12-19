import { repairPdf } from './repair-pdf.js';
import { state } from '../state.js';
import { renderFileDisplay } from '../ui.js';

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    const dropZone = document.getElementById('drop-zone');
    const processBtn = document.getElementById('process-btn');
    const fileDisplayArea = document.getElementById('file-display-area');

    const fileControls = document.getElementById('file-controls');
    const addMoreBtn = document.getElementById('add-more-btn');
    const clearFilesBtn = document.getElementById('clear-files-btn');
    const backBtn = document.getElementById('back-to-tools');

    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = import.meta.env.BASE_URL;
        });
    }

    const updateUI = () => {
        if (state.files.length > 0) {
            renderFileDisplay(fileDisplayArea, state.files);
            if (processBtn) processBtn.classList.remove('hidden');
            if (fileControls) fileControls.classList.remove('hidden');
        } else {
            if (fileDisplayArea) fileDisplayArea.innerHTML = '';
            if (processBtn) processBtn.classList.add('hidden');
            if (fileControls) fileControls.classList.add('hidden');
        }
    };

    if (fileInput && dropZone) {
        fileInput.addEventListener('change', async (e) => {
            const files = (e.target as HTMLInputElement).files;
            if (files && files.length > 0) {
                state.files = [...state.files, ...Array.from(files)];
                updateUI();
            }
        });

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('bg-gray-700');
        });

        dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dropZone.classList.remove('bg-gray-700');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('bg-gray-700');
            const files = e.dataTransfer?.files;
            if (files && files.length > 0) {
                const pdfFiles = Array.from(files).filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
                if (pdfFiles.length > 0) {
                    state.files = [...state.files, ...pdfFiles];
                    updateUI();
                }
            }
        });

        // Clear value on click to allow re-selecting the same file
        fileInput.addEventListener('click', () => {
            fileInput.value = '';
        });
    }

    if (addMoreBtn) {
        addMoreBtn.addEventListener('click', () => {
            fileInput.click();
        });
    }

    if (clearFilesBtn) {
        clearFilesBtn.addEventListener('click', () => {
            state.files = [];
            updateUI();
        });
    }

    if (processBtn) {
        processBtn.addEventListener('click', async () => {
            await repairPdf();
        });
    }

    updateUI();
});
