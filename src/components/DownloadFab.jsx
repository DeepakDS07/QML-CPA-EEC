import React, { useState } from 'react';
import { Download, FileText, CheckCircle2 } from 'lucide-react';
import { REPORT_DOWNLOAD_URL } from '../api/client';

export default function DownloadFab() {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    const link = document.createElement('a');
    link.href = REPORT_DOWNLOAD_URL;
    link.setAttribute('download', 'Quantum_AI_Technical_Report.pdf');
    link.setAttribute('target', '_blank');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => setDownloading(false), 2000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={handleDownload}
        className="btn-primary-quantum px-4 py-2.5 text-xs flex items-center gap-2.5 font-medium tracking-wider"
      >
        {downloading ? (
          <>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="font-mono">Downloading PDF...</span>
          </>
        ) : (
          <>
            <FileText className="w-4 h-4" />
            <span className="font-mono">Download Technical Report</span>
            <Download className="w-4 h-4 ml-0.5" />
          </>
        )}
      </button>
    </div>
  );
}
