import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from '../pdf.worker?worker&url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
