import Tesseract from 'tesseract.js';

const commonDrugPatterns = [
  /metformin/i,
  /lisinopril/i,
  /atorvastatin/i,
  /amlodipine/i,
  /omeprazole/i,
  /metoprolol/i,
  /losartan/i,
  /gabapentin/i,
  /warfarin/i,
  /aspirin/i,
  /ibuprofen/i,
  /amoxicillin/i,
  /azithromycin/i,
  /prednisone/i,
  /levothyroxine/i,
  /simvastatin/i,
  /hydrochlorothiazide/i,
  /sertraline/i,
  /fluoxetine/i,
  /tramadol/i,
  /oxycodone/i,
  /hydrocodone/i,
  /alprazolam/i,
  /lorazepam/i,
  /clonazepam/i,
  /zolpidem/i,
  /ciprofloxacin/i,
  /doxycycline/i,
  /naproxen/i,
  /acetaminophen/i,
  /paracetamol/i,
];

export async function extractDrugsFromImage(imageFile) {
  try {
    const result = await Tesseract.recognize(imageFile, 'eng', {
      logger: (m) => console.log(m),
    });

    const text = result.data.text;
    const confidence = result.data.confidence;

    const foundDrugs = [];
    
    for (const pattern of commonDrugPatterns) {
      const match = text.match(pattern);
      if (match) {
        const drugName = match[0];
        if (!foundDrugs.some(d => d.name.toLowerCase() === drugName.toLowerCase())) {
          foundDrugs.push({
            name: capitalizeFirstLetter(drugName),
            category: 'Detected',
            dosage: 'Unknown',
            confidence: confidence,
          });
        }
      }
    }

    return {
      success: true,
      drugs: foundDrugs,
      rawText: text,
      confidence: confidence,
      message: foundDrugs.length > 0
        ? `Found ${foundDrugs.length} medication${foundDrugs.length > 1 ? 's' : ''} in the prescription`
        : 'No medications detected. Please add them manually.',
    };
  } catch (error) {
    console.error('OCR Error:', error);
    return {
      success: false,
      drugs: [],
      rawText: '',
      confidence: 0,
      message: 'Failed to process image. Please try again or add medications manually.',
      error: error.message,
    };
  }
}

export async function extractDrugsFromPDF(pdfFile) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const arrayBuffer = e.target.result;
      
      try {
        const pdfjsLib = window.pdfjsLib;
        if (pdfjsLib) {
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          let fullText = '';
          
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n';
          }
          
          const foundDrugs = [];
          for (const pattern of commonDrugPatterns) {
            const match = fullText.match(pattern);
            if (match) {
              const drugName = match[0];
              if (!foundDrugs.some(d => d.name.toLowerCase() === drugName.toLowerCase())) {
                foundDrugs.push({
                  name: capitalizeFirstLetter(drugName),
                  category: 'Detected',
                  dosage: 'Unknown',
                });
              }
            }
          }
          
          resolve({
            success: true,
            drugs: foundDrugs,
            rawText: fullText,
            message: foundDrugs.length > 0
              ? `Found ${foundDrugs.length} medication${foundDrugs.length > 1 ? 's' : ''} in the prescription`
              : 'No medications detected. Please add them manually.',
          });
        } else {
          resolve({
            success: false,
            drugs: [],
            message: 'PDF processing library not loaded. Please add medications manually.',
          });
        }
      } catch (error) {
        resolve({
          success: false,
          drugs: [],
          message: 'Failed to process PDF. Please add medications manually.',
          error: error.message,
        });
      }
    };
    
    reader.onerror = () => {
      resolve({
        success: false,
        drugs: [],
        message: 'Failed to read file. Please try again.',
      });
    };
    
    reader.readAsArrayBuffer(pdfFile);
  });
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

export function isImageFile(file) {
  return file.type.startsWith('image/');
}

export function isPDFFile(file) {
  return file.type === 'application/pdf';
}

export function processUploadedFile(file) {
  if (isPDFFile(file)) {
    return extractDrugsFromPDF(file);
  } else if (isImageFile(file)) {
    return extractDrugsFromImage(file);
  } else {
    return Promise.resolve({
      success: false,
      drugs: [],
      message: 'Unsupported file type. Please upload a PDF or image file.',
    });
  }
}
