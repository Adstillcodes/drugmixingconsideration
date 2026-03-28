import Tesseract from 'tesseract.js';
import { extractMedicationsFromText } from './medicationExtractor.js';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

export async function processOCR(req, res) {
  try {
    const { image, imageUrl } = req.body;

    if (!image && !imageUrl) {
      return res.status(400).json({
        success: false,
        error: 'No image data provided',
      });
    }

    let imageSource;
    let rawText = '';

    if (image) {
      const isPDF = image.startsWith('data:application/pdf') || image.startsWith('%PDF');

      if (isPDF) {
        console.log('Processing PDF document...');
        const base64Data = image.startsWith('data:')
          ? image.split(',')[1]
          : image;
        const pdfBuffer = Buffer.from(base64Data, 'base64');
        const pdfArray = new Uint8Array(pdfBuffer);

        try {
          const loadingTask = getDocument({ data: pdfArray });
          const pdfDoc = await loadingTask.promise;
          const numPages = pdfDoc.numPages;
          console.log(`PDF has ${numPages} pages`);

          let fullText = '';
          for (let i = 1; i <= numPages; i++) {
            const page = await pdfDoc.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
              .map((item) => item.str)
              .join(' ');
            fullText += pageText + '\n';
          }
          rawText = fullText;
          console.log('PDF text extracted, length:', rawText.length);
        } catch (pdfError) {
          console.error('PDF parsing error:', pdfError);
          throw pdfError;
        }
      } else {
        if (image.startsWith('data:')) {
          imageSource = image;
        } else {
          imageSource = `data:image/jpeg;base64,${image}`;
        }
        console.log('Processing image...');
        const result = await Tesseract.recognize(imageSource, 'eng', {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
            }
          },
        });
        rawText = result.data.text;
        console.log('OCR complete, extracted text length:', rawText.length);
      }
    } else if (imageUrl) {
      console.log('Processing image from URL...');
      const result = await Tesseract.recognize(imageUrl, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        },
      });
      rawText = result.data.text;
      console.log('OCR complete, extracted text length:', rawText.length);
    }

    const extractedMeds = await extractMedicationsFromText(rawText);

    res.json({
      success: true,
      rawText,
      medications: extractedMeds,
      confidence: 100,
    });
  } catch (error) {
    console.error('OCR Error:', error);
    res.status(500).json({
      success: false,
      error: 'OCR processing failed',
      message: error.message,
    });
  }
}
