"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportToMarkdown = exports.exportToDocx = exports.exportToPDF = void 0;
const Book_1 = __importDefault(require("../models/Book"));
const pdfkit_1 = __importDefault(require("pdfkit"));
const docx_1 = require("docx");
// @desc    Export book to PDF
// @route   GET /api/export/pdf/:id
// @access  Private
const exportToPDF = async (req, res) => {
    try {
        const book = await Book_1.default.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }
        if (book.userId.toString() !== req.user?._id?.toString()) {
            return res
                .status(401)
                .json({ message: "Not authorized to export this book" });
        }
        // Create a new PDF document
        const doc = new pdfkit_1.default({
            margins: {
                top: 50,
                bottom: 50,
                left: 50,
                right: 50,
            },
        });
        // Set response headers
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${book.title.replace(/[^a-z0-9]/gi, "_")}.pdf"`);
        // Pipe the PDF to the response
        doc.pipe(res);
        // Add title
        doc.fontSize(24).font("Helvetica-Bold").text(book.title, {
            align: "center",
        });
        // Add subtitle if exists
        if (book.subtitle) {
            doc.moveDown(0.5);
            doc.fontSize(16).font("Helvetica-Oblique").text(book.subtitle, {
                align: "center",
            });
        }
        // Add author
        doc.moveDown(0.5);
        doc.fontSize(14).font("Helvetica").text(`by ${book.author}`, {
            align: "center",
        });
        doc.moveDown(2);
        // Add chapters
        book.chapters.forEach((chapter, index) => {
            // Add page break before each chapter (except the first)
            if (index > 0) {
                doc.addPage();
            }
            // Chapter title
            doc
                .fontSize(18)
                .font("Helvetica-Bold")
                .text(`Chapter ${index + 1}: ${chapter.title}`);
            doc.moveDown(0.5);
            // Chapter description
            if (chapter.description) {
                doc
                    .fontSize(12)
                    .font("Helvetica-Oblique")
                    .text(chapter.description);
                doc.moveDown(0.5);
            }
            // Chapter content
            if (chapter.content) {
                doc.fontSize(11).font("Helvetica").text(chapter.content, {
                    align: "justify",
                    lineGap: 5,
                });
            }
            doc.moveDown(1);
        });
        // Finalize the PDF
        doc.end();
    }
    catch (error) {
        console.error("PDF Export Error:", error);
        res.status(500).json({ message: "Failed to export PDF" });
    }
};
exports.exportToPDF = exportToPDF;
// @desc    Export book to DOCX
// @route   GET /api/export/docx/:id
// @access  Private
const exportToDocx = async (req, res) => {
    try {
        const book = await Book_1.default.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }
        if (book.userId.toString() !== req.user?._id?.toString()) {
            return res
                .status(401)
                .json({ message: "Not authorized to export this book" });
        }
        // Create document sections
        const sections = [];
        // Title page
        const titleParagraphs = [
            new docx_1.Paragraph({
                text: book.title,
                heading: docx_1.HeadingLevel.TITLE,
                spacing: { after: 200 },
            }),
        ];
        if (book.subtitle) {
            titleParagraphs.push(new docx_1.Paragraph({
                text: book.subtitle,
                heading: docx_1.HeadingLevel.HEADING_2,
                spacing: { after: 200 },
            }));
        }
        titleParagraphs.push(new docx_1.Paragraph({
            text: `by ${book.author}`,
            spacing: { after: 400 },
        }));
        // Add chapters
        const chapterParagraphs = [];
        book.chapters.forEach((chapter, index) => {
            // Chapter title
            chapterParagraphs.push(new docx_1.Paragraph({
                text: `Chapter ${index + 1}: ${chapter.title}`,
                heading: docx_1.HeadingLevel.HEADING_1,
                spacing: { before: 400, after: 200 },
                pageBreakBefore: index > 0,
            }));
            // Chapter description
            if (chapter.description) {
                chapterParagraphs.push(new docx_1.Paragraph({
                    children: [
                        new docx_1.TextRun({
                            text: chapter.description,
                            italics: true,
                        }),
                    ],
                    spacing: { after: 200 },
                }));
            }
            // Chapter content
            if (chapter.content) {
                // Split content into paragraphs
                const contentParagraphs = chapter.content.split("\n\n");
                contentParagraphs.forEach((para) => {
                    if (para.trim()) {
                        chapterParagraphs.push(new docx_1.Paragraph({
                            text: para.trim(),
                            spacing: { after: 200 },
                        }));
                    }
                });
            }
        });
        // Create the document
        const doc = new docx_1.Document({
            sections: [
                {
                    properties: {},
                    children: [...titleParagraphs, ...chapterParagraphs],
                },
            ],
        });
        // Generate buffer
        const buffer = await docx_1.Packer.toBuffer(doc);
        // Set response headers
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        res.setHeader("Content-Disposition", `attachment; filename="${book.title.replace(/[^a-z0-9]/gi, "_")}.docx"`);
        res.send(buffer);
    }
    catch (error) {
        console.error("DOCX Export Error:", error);
        res.status(500).json({ message: "Failed to export DOCX" });
    }
};
exports.exportToDocx = exportToDocx;
// @desc    Export book to Markdown
// @route   GET /api/export/markdown/:id
// @access  Private
const exportToMarkdown = async (req, res) => {
    try {
        const book = await Book_1.default.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }
        if (book.userId.toString() !== req.user?._id?.toString()) {
            return res
                .status(401)
                .json({ message: "Not authorized to export this book" });
        }
        // Build markdown content
        let markdown = `# ${book.title}\n\n`;
        if (book.subtitle) {
            markdown += `## ${book.subtitle}\n\n`;
        }
        markdown += `**Author:** ${book.author}\n\n`;
        markdown += `---\n\n`;
        // Add chapters
        book.chapters.forEach((chapter, index) => {
            markdown += `## Chapter ${index + 1}: ${chapter.title}\n\n`;
            if (chapter.description) {
                markdown += `*${chapter.description}*\n\n`;
            }
            if (chapter.content) {
                markdown += `${chapter.content}\n\n`;
            }
            markdown += `---\n\n`;
        });
        // Set response headers
        res.setHeader("Content-Type", "text/markdown");
        res.setHeader("Content-Disposition", `attachment; filename="${book.title.replace(/[^a-z0-9]/gi, "_")}.md"`);
        res.send(markdown);
    }
    catch (error) {
        console.error("Markdown Export Error:", error);
        res.status(500).json({ message: "Failed to export Markdown" });
    }
};
exports.exportToMarkdown = exportToMarkdown;
// Export handled by inline export const
