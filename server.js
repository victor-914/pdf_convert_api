const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const PDFDocument = require('pdfkit');
const fs = require('fs');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.text()); // for plain text requests
app.use(bodyParser.json()); // for JSON requests

// Route to handle text to PDF conversion
app.post('/convert', (req, res) => {
  try {
    // Get text from request
    let textContent = '';
    
    if (req.is('json')) {
      textContent = req.body.text || 'No text provided';
    } else {
      textContent = req.body || 'No text provided';
    }

    // Create a new PDF document
    const doc = new PDFDocument();
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=converted.pdf');
    
    // Pipe the PDF directly to the response
    doc.pipe(res);

    // Add content to the PDF
    doc.fontSize(12).text(textContent, {
      align: 'left',
      width: 500,
      indent: 30
    });

    // Finalize the PDF and end the stream
    doc.end();
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'PDF generation failed', 
      details: error.message 
    });
  }
});

// GET endpoint
app.get('/convert', (req, res) => {
  try {
    const textContent = req.query.text || 'No text provided';
    
    const doc = new PDFDocument();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=converted.pdf');
    
    doc.pipe(res);
    
    doc.fontSize(12).text(textContent, {
      align: 'left',
      width: 500,
      indent: 30
    });
    
    doc.end();
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'PDF generation failed', 
      details: error.message 
    });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`POST endpoint: http://localhost:${PORT}/convert`);
  console.log(`GET endpoint: http://localhost:${PORT}/convert?text=YourTextHere`);
});