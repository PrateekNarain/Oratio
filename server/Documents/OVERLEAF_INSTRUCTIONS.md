# Overleaf Instructions for Oratio Research Paper

## Quick Start

1. **Go to Overleaf**: https://www.overleaf.com/
2. **Create New Project** → Click "New Project" → Select "Blank Project"
3. **Upload the LaTeX file**: Upload `oratio_paper.tex` to your project
4. **Compile**: Click the "Recompile" button (or it will auto-compile)

## File Information

- **File**: `oratio_paper.tex`
- **Document Class**: IEEEtran (IEEE Conference Paper Format)
- **Pages**: Approximately 8-10 pages (standard conference paper length)
- **Format**: Two-column IEEE format

## What's Included

### Document Structure
✅ Title and author information
✅ Abstract with keywords
✅ 7 main sections (Introduction, Related Work, Architecture, Implementation, Results, Challenges, Conclusion)
✅ 5 tables with experimental results
✅ Code listings with syntax highlighting
✅ 22 academic references (properly formatted)
✅ IEEE bibliography style

### Content Highlights
- **Section I**: Introduction with background, problem statement, objectives, and contributions
- **Section II**: Related work covering speech analysis, NLP, LLMs, and optimization
- **Section III**: System architecture and methodology
- **Section IV**: Detailed pipeline implementation with code examples
- **Section V**: Experimental results with 5 tables showing performance metrics
- **Section VI**: Challenges and solutions (4 major challenges documented)
- **Section VII**: Future work and conclusion

### Tables Included
1. **Table I**: Processing time breakdown
2. **Table II**: Token usage comparison (showing 92.3% reduction)
3. **Table III**: Expert agreement rates with Cohen's kappa
4. **Table IV**: System reliability metrics
5. **Table V**: Comparison with existing systems

## Customization

### Change Author Information
Find this section and edit:
```latex
\author{\IEEEauthorblockN{Anonymous Authors}
\IEEEauthorblockA{\textit{Department of Computer Science} \\
\textit{University Name}\\
City, Country \\
email@university.edu}
}
```

### Add More Authors
```latex
\author{
\IEEEauthorblockN{First Author}
\IEEEauthorblockA{\textit{dept. name} \\
\textit{university}\\
City, Country \\
email@address}
\and
\IEEEauthorblockN{Second Author}
\IEEEauthorblockA{\textit{dept. name} \\
\textit{university}\\
City, Country \\
email@address}
}
```

### Add Figures
To add architecture diagrams or flowcharts:

```latex
\begin{figure}[htbp]
\centerline{\includegraphics[width=\columnwidth]{architecture.png}}
\caption{System Architecture Diagram}
\label{fig:architecture}
\end{figure}
```

Then upload your image file (PNG, PDF, or EPS) to Overleaf.

### Modify Tables
Tables use standard LaTeX tabular environment. Example:
```latex
\begin{table}[htbp]
\caption{Your Table Title}
\begin{center}
\begin{tabular}{|l|c|c|}
\hline
\textbf{Column 1} & \textbf{Column 2} & \textbf{Column 3} \\
\hline
Data 1 & Data 2 & Data 3 \\
\hline
\end{tabular}
\end{center}
\end{table}
```

## Compilation Settings

The document should compile automatically with:
- **Compiler**: pdfLaTeX (default)
- **Main document**: oratio_paper.tex

If you encounter errors, try:
1. Click "Recompile from scratch" (trash icon next to Recompile button)
2. Check the log for specific error messages

## Common Packages Used

All packages are standard and included in Overleaf:
- `IEEEtran` - IEEE conference paper format
- `cite` - Citation management
- `amsmath, amssymb, amsfonts` - Mathematical symbols
- `graphicx` - Image inclusion
- `listings` - Code syntax highlighting
- `booktabs` - Professional tables
- `hyperref` - Clickable links and references

## Export Options

Once compiled, you can:
1. **Download PDF**: Click "Download PDF" button
2. **Download Source**: Menu → Download → Source (gets all .tex files)
3. **Submit to Conference**: Download PDF and submit directly

## Tips for Conference Submission

1. **Check Page Limit**: Most conferences have 6-8 page limits. This paper is ~8-10 pages.
2. **Reduce Length**: Remove some code listings or combine tables if needed
3. **Add Figures**: Replace ASCII diagrams with proper figures for better visual appeal
4. **Proofread**: Use Overleaf's spell checker (click "Review" button)
5. **Check References**: Ensure all citations [1], [2], etc. are properly linked

## Converting to Other Formats

### ACM Format
Change first line to:
```latex
\documentclass[sigconf]{acmart}
```

### Springer LNCS Format
Change first line to:
```latex
\documentclass{llncs}
```

### arXiv Submission
The current format works perfectly for arXiv. Just upload the .tex file and any images.

## Troubleshooting

### "Undefined control sequence" error
- Usually means a package is missing or command is misspelled
- Check the log for the specific line number

### Tables/Figures not appearing
- Make sure they're in a float environment: `\begin{table}[htbp]`
- Try different position specifiers: `[h]`, `[t]`, `[b]`, `[p]`

### References not showing
- Make sure you have `\cite{}` commands in the text
- Check that bibliography items have unique labels

### Code not formatting correctly
- Ensure `listings` package is loaded
- Check that code is inside `\begin{lstlisting}...\end{lstlisting}`

## Additional Resources

- **IEEE Template Guide**: https://www.ieee.org/conferences/publishing/templates.html
- **Overleaf Documentation**: https://www.overleaf.com/learn
- **LaTeX Tables Generator**: https://www.tablesgenerator.com/
- **LaTeX Symbols**: https://www.overleaf.com/learn/latex/List_of_Greek_letters_and_math_symbols

## Contact

For questions about the paper content or LaTeX formatting, refer to:
- Overleaf Help: https://www.overleaf.com/learn
- LaTeX Stack Exchange: https://tex.stackexchange.com/

---

**Ready to publish!** This paper follows standard IEEE conference format and is ready for submission to conferences like ICASSP, INTERSPEECH, ACL, EMNLP, or similar venues.
