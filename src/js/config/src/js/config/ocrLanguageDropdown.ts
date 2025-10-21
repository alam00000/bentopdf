import Tesseract from "tesseract.js";

const tesseractLanguages: Record<string, string> = {
  eng: "English",
  afr: "Afrikaans",
  amh: "Amharic",
  ara: "Arabic",
  ben: "Bengali",
  deu: "German",
  fra: "French",
  hin: "Hindi",
  jpn: "Japanese",
  rus: "Russian",
  spa: "Spanish"
  // ...add more if needed
};

export function initOcrLanguageDropdown() {
  const dropdown = document.getElementById("ocrLanguageDropdown") as HTMLSelectElement | null;
  const fileInput = document.getElementById("ocrFile") as HTMLInputElement | null;
  const outputArea = document.getElementById("ocrOutput") as HTMLTextAreaElement | null;
  const processBtn = document.getElementById("ocrProcessBtn") as HTMLButtonElement | null;

  if (!dropdown || !fileInput || !outputArea || !processBtn) {
    console.warn("OCR language dropdown elements not found in DOM.");
    return;
  }

  // Populate dropdown
  Object.entries(tesseractLanguages).forEach(([code, name]) => {
    const option = document.createElement("option");
    option.value = code;
    option.textContent = name;
    dropdown.appendChild(option);
  });

  let selectedLang = dropdown.value || "eng";
  let selectedFile: File | null = null;

  dropdown.addEventListener("change", (e) => {
    selectedLang = (e.target as HTMLSelectElement).value;
  });

  fileInput.addEventListener("change", (e) => {
    const files = (e.target as HTMLInputElement).files;
    selectedFile = files && files[0] ? files[0] : null;
  });

  processBtn.addEventListener("click", async () => {
    if (!selectedFile) return alert("Please select an image first.");

    processBtn.disabled = true;
    processBtn.textContent = "Processing...";

    try {
      const { data } = await Tesseract.recognize(selectedFile, selectedLang);
      outputArea.value = data.text.trim();
    } catch (err) {
      console.error("OCR failed:", err);
      alert("OCR failed. See console for details.");
    } finally {
      processBtn.disabled = false;
      processBtn.textContent = "Extract Text";
    }
  });
}
