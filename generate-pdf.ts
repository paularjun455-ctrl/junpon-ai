import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';

// Find all code files recursively in /src and some specific files in /
function findCodeFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (
        file !== 'node_modules' &&
        file !== 'dist' &&
        file !== '.git' &&
        file !== 'build'
      ) {
        findCodeFiles(filePath, fileList);
      }
    } else {
      const ext = path.extname(file);
      if (['.ts', '.tsx', '.css', '.html', '.json'].includes(ext)) {
        // Exclude locks and package-lock
        if (
          !file.includes('lock') &&
          file !== 'tsconfig.json' &&
          file !== 'components.json'
        ) {
          fileList.push(filePath);
        }
      }
    }
  }

  return fileList;
}

// Simple TypeScript and CSS token tokenizer for syntax highlighting
function tokenizeLine(line: string, ext: string): { text: string; color: string }[] {
  const trimmed = line.trim();
  
  // Handlers for comment lines
  if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
    return [{ text: line, color: '#6A9955' }]; // VS Code comment green
  }

  // CSS/JSON simple coloring
  if (ext === '.css' || ext === '.json') {
    if (ext === '.json') {
      const reg = /("[^"]*")|(\b\d+\b)|([{}[\],:])|(\s+)/g;
      const tokens: { text: string; color: string }[] = [];
      let match;
      while ((match = reg.exec(line)) !== null) {
        const [full, str, num, sym, space] = match;
        if (str) tokens.push({ text: str, color: str.includes(':') ? '#9CDCFE' : '#CE9178' });
        else if (num) tokens.push({ text: num, color: '#B5CEA8' });
        else if (sym) tokens.push({ text: sym, color: '#D4D4D4' });
        else if (space) tokens.push({ text: space, color: '#D4D4D4' });
      }
      return tokens.length > 0 ? tokens : [{ text: line, color: '#E2E8F0' }];
    }
  }

  // TypeScript / JavaScript tokenizer
  const tokens: { text: string; color: string }[] = [];
  const regex = /(\/\/.*)|("[^"\\]*(?:\\.[^"\\]*)*"|'[^'\\]*(?:\\.[^'\\]*)*'|`[^`\\]*(?:\\.[^`\\]*)*`)|\b(const|let|var|function|return|import|export|from|default|class|interface|type|extends|implements|if|else|for|while|do|switch|case|break|continue|new|this|typeof|instanceof|as|any|string|number|boolean|void|null|undefined|true|false|async|await|try|catch|finally|throw)\b|\b(\d+)\b|([^\s"'`\/\d\w]+)|(\w+)|(\s+)/g;

  let match;
  while ((match = regex.exec(line)) !== null) {
    const [
      full,
      comment,
      str,
      keyword,
      num,
      symbol,
      word,
      space
    ] = match;

    if (comment) {
      tokens.push({ text: comment, color: '#6A9955' });
    } else if (str) {
      tokens.push({ text: str, color: '#CE9178' });
    } else if (keyword) {
      tokens.push({ text: keyword, color: '#569CD6' }); // Blue
    } else if (num) {
      tokens.push({ text: num, color: '#B5CEA8' }); // Light green-ish
    } else if (symbol) {
      tokens.push({ text: symbol, color: '#A9B7C6' }); // Warm white/gray
    } else if (word) {
      // Color capitalize words (likely React components or classes) differently
      if (word[0] === word[0].toUpperCase()) {
        tokens.push({ text: word, color: '#4EC9B0' }); // Cyan-green for components
      } else {
        tokens.push({ text: word, color: '#9CDCFE' }); // Light blue/cyan properties
      }
    } else if (space) {
      tokens.push({ text: space, color: '#CCCCCC' });
    }
  }

  if (tokens.length === 0) {
    tokens.push({ text: line, color: '#E2E8F0' });
  }

  return tokens;
}

export function generateCodePdf(outputPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        bufferPages: true,
        size: 'A4',
        margin: 40,
        info: {
          Title: 'Junpon AI - Complete Source Code',
          Author: 'Arjun Paul Arpon',
          Subject: 'Full Project Source Code Export',
        },
      });

      const writeStream = fs.createWriteStream(outputPath);
      doc.pipe(writeStream);

      // --- TITLE PAGE ---
      doc.rect(0, 0, doc.page.width, doc.page.height).fill('#0B0F19');

      // Decorative background shape
      doc.save();
      doc.opacity(0.15);
      doc.fillColor('#20C997');
      doc.polygon([400, 0], [doc.page.width, 0], [doc.page.width, 400]);
      doc.fill();
      doc.restore();

      doc.fillColor('#20C997');
      doc.fontSize(28);
      doc.font('Helvetica-Bold');
      doc.text('JUNPON AI', 50, 200);

      doc.fillColor('#FFFFFF');
      doc.fontSize(16);
      doc.font('Helvetica');
      doc.text('COMPLETE SOURCE CODE PACKAGE', 50, 240);

      doc.rect(50, 270, 120, 3).fill('#20C997');

      doc.fillColor('#9CA3AF');
      doc.fontSize(10);
      doc.font('Helvetica-Oblique');
      doc.text('A comprehensive PDF containing all the frontend, styling, and server codebase.', 50, 290);

      // Metadata section
      doc.font('Helvetica-Bold');
      doc.fillColor('#E5E7EB');
      doc.fontSize(11);
      doc.text('PROJECT DETAILS:', 50, 370);

      const metadata = [
        ['Founder & CEO', 'Arjun Paul Arpon'],
        ['Created/Modified', new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })],
        ['Platform Architecture', 'React + Vite + Express + TailwindCSS + Gemini SDK'],
        ['Primary Language', 'TypeScript'],
      ];

      let yPos = 395;
      doc.font('Helvetica');
      for (const [key, value] of metadata) {
        doc.fillColor('#20C997').text(key + ':', 50, yPos, { width: 140 });
        doc.fillColor('#FFFFFF').text(value, 190, yPos);
        yPos += 18;
      }

      // Add a small footer on front page
      doc.fillColor('#4B5563');
      doc.fontSize(8);
      doc.text('© 2026 Junpon AI. All Rights Reserved.', 50, doc.page.height - 60);

      // --- FIND SOURCE FILES ---
      const workspaceRoot = process.cwd();
      const filesToInclude: string[] = [];

      // Add root configs first
      const rootFiles = ['package.json', 'server.ts', 'index.html', 'vite.config.ts'];
      for (const rf of rootFiles) {
        const fullPath = path.join(workspaceRoot, rf);
        if (fs.existsSync(fullPath)) {
          filesToInclude.push(fullPath);
        }
      }

      // Add src files recursively
      const srcDir = path.join(workspaceRoot, 'src');
      if (fs.existsSync(srcDir)) {
        findCodeFiles(srcDir, filesToInclude);
      }

      // --- TABLE OF CONTENTS ---
      doc.addPage();
      // Reset back to standard white background with elegant gray layout
      doc.rect(0, 0, doc.page.width, doc.page.height).fill('#0B0F19');

      doc.fillColor('#20C997').fontSize(18).font('Helvetica-Bold').text('TABLE OF CONTENTS', 50, 50);
      doc.rect(50, 75, doc.page.width - 100, 1).fill('#1F2937');

      yPos = 100;
      doc.fontSize(10).font('Helvetica');

      // We'll map file names to page placeholders first
      const tocEntries: { path: string; relPath: string; pageNo: number }[] = [];

      for (const filePath of filesToInclude) {
        const relPath = path.relative(workspaceRoot, filePath);
        tocEntries.push({ path: filePath, relPath, pageNo: 0 });
      }

      // First run through, reserve pages and write code
      let fileIdx = 0;
      for (const entry of tocEntries) {
        doc.addPage();
        // Set background to a dark, very pleasant programmer-friendly theme
        doc.rect(0, 0, doc.page.width, doc.page.height).fill('#090D16');

        entry.pageNo = doc.bufferedPageRange().count;

        // Header for this file
        doc.fillColor('#20C997').fontSize(11).font('Helvetica-Bold').text(`[FILE ${fileIdx + 1}/${tocEntries.length}]`, 40, 40);
        doc.fillColor('#FFFFFF').fontSize(12).text(entry.relPath, 40, 56);
        doc.rect(40, 74, doc.page.width - 80, 1).fill('#1E293B');

        // Read file content
        const code = fs.readFileSync(entry.path, 'utf8');
        const lines = code.split('\n');

        let codeY = 90;
        let lineCount = 1;
        const ext = path.extname(entry.path);

        doc.font('Courier');

        for (const line of lines) {
          // Replace tabs with 4 spaces for elegant formatting
          const cleanLine = line.replace(/\t/g, '    ');
          
          // Calculate the height required for this code line with font size 7.5
          doc.fontSize(7.5);
          const lineOpts = { width: doc.page.width - 130 };
          const neededHeight = doc.heightOfString(cleanLine, lineOpts);

          // If we reach near the bottom of page, add a new page
          if (codeY + neededHeight > doc.page.height - 55) {
            doc.addPage();
            doc.rect(0, 0, doc.page.width, doc.page.height).fill('#090D16');
            
            // Header on subsequent pages of the same file
            doc.fillColor('#475569').fontSize(9).font('Helvetica-Bold').text(`${entry.relPath} (continued)`, 40, 40);
            doc.rect(40, 55, doc.page.width - 80, 1).fill('#1E293B');
            codeY = 70;
          }

          // Format line number
          const lineNumStr = String(lineCount).padStart(4, ' ') + ' | ';
          
          // Print line number in dimmed green color
          doc.fontSize(7.5).font('Courier');
          doc.fillColor('#10B981').text(lineNumStr, 40, codeY, { width: 40 });
          
          // Render code tokens inline to achieve premium syntax highlighting
          const tokens = tokenizeLine(cleanLine, ext);
          
          // Position the start of code content
          doc.text('', 85, codeY, { continued: true, ...lineOpts });
          
          for (let j = 0; j < tokens.length; j++) {
            const tok = tokens[j];
            const isLast = j === tokens.length - 1;
            doc.fillColor(tok.color).text(tok.text, { continued: !isLast });
          }
          
          // Advance codeY by the actual wrapping-safe height of this code line
          codeY += neededHeight + 1.2;
          lineCount++;
        }

        fileIdx++;
      }

      // Let's write Table of Contents entries to page 2 (index 1)
      const range = doc.bufferedPageRange();
      doc.switchToPage(1);

      doc.rect(0, 0, doc.page.width, doc.page.height).fill('#0B0F19');
      doc.fillColor('#20C997').fontSize(18).font('Helvetica-Bold').text('TABLE OF CONTENTS', 50, 50);
      doc.rect(50, 75, doc.page.width - 100, 1).fill('#1F2937');

      yPos = 100;
      doc.fontSize(9).font('Helvetica');

      for (let i = 0; i < tocEntries.length; i++) {
        const entry = tocEntries[i];
        
        // Ensure table of contents fits or spans pages
        if (yPos > doc.page.height - 70) {
          doc.addPage();
        }

        doc.fillColor('#E5E7EB').text(entry.relPath, 50, yPos, { width: doc.page.width - 120, continued: true });
        
        // Dots decoration
        const dotsCount = Math.max(10, Math.floor((doc.page.width - 200 - doc.widthOfString(entry.relPath)) / 4));
        const dots = '.'.repeat(dotsCount);
        
        doc.fillColor('#4B5563').text(dots, { continued: true });
        doc.fillColor('#20C997').font('Helvetica-Bold').text(`Page ${entry.pageNo}`, doc.page.width - 90, yPos, { align: 'right' });
        
        doc.font('Helvetica');
        yPos += 16;
      }

      // --- ADD GLOBAL FOOTERS WITH PAGE NUMBERS ---
      // We start from index 1 (Table of Contents) to the last page
      for (let i = 1; i < range.count; i++) {
        doc.switchToPage(i);
        doc.rect(40, doc.page.height - 45, doc.page.width - 80, 0.5).fill('#1E293B');
        
        doc.fillColor('#64748B').fontSize(8).font('Helvetica');
        doc.text('Junpon AI — Source Code Package', 40, doc.page.height - 35);
        doc.text(`Page ${i + 1} of ${range.count}`, doc.page.width - 120, doc.page.height - 35, { align: 'right' });
      }

      doc.end();

      writeStream.on('finish', () => {
        resolve(outputPath);
      });

      writeStream.on('error', (err) => {
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
}
