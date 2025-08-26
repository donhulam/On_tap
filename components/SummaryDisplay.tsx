import React, { useRef, useState, useEffect } from 'react';
import type { SummaryData, PracticeQuestion } from '../types';
import { PdfIcon, CopyIcon, CheckIcon } from './icons';

interface SummaryDisplayProps {
  summaryData: SummaryData | null;
  isLoading: boolean;
  error: string | null;
  mainTopic: string;
}

declare const jspdf: any;
declare const html2canvas: any;

const SummaryDisplay: React.FC<SummaryDisplayProps> = ({ summaryData, isLoading, error, mainTopic }) => {
  const summaryContentRef = useRef<HTMLDivElement>(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => setIsCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  const addHeaderAndFooter = (pdf: any, totalPages: number) => {
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const today = new Date().toLocaleDateString('vi-VN');
    const topic = mainTopic || "Tóm tắt ôn tập";

    for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);

        // Header
        pdf.setFontSize(10);
        pdf.setTextColor(100);
        pdf.text('Trợ lý ôn tập AI', margin, margin - 5);
        
        pdf.setFontSize(12);
        pdf.setTextColor(0);
        // Truncate long topics
        const truncatedTopic = topic.length > 50 ? topic.substring(0, 47) + '...' : topic;
        pdf.text(`Chủ đề: ${truncatedTopic}`, pdfWidth / 2, margin - 5, { align: 'center' });
        
        pdf.setDrawColor(200);
        pdf.line(margin, margin - 2, pdfWidth - margin, margin - 2);

        // Footer
        pdf.setFontSize(8);
        pdf.setTextColor(150);
        pdf.text(`Ngày tạo: ${today}`, margin, pdfHeight - margin + 10);
        const pageStr = `Trang ${i} / ${totalPages}`;
        pdf.text(pageStr, pdfWidth - margin, pdfHeight - margin + 10, { align: 'right' });
    }
  };


  const handleExportPdf = () => {
    if (summaryContentRef.current && typeof jspdf !== 'undefined' && typeof html2canvas !== 'undefined') {
      const { jsPDF } = jspdf;
      const content = summaryContentRef.current;
      
      const originalPadding = content.style.padding;
      content.style.padding = '15px';

      html2canvas(content, { 
        scale: 2,
        useCORS: true,
        windowWidth: content.scrollWidth,
        windowHeight: content.scrollHeight
      }).then((canvas: any) => {
        content.style.padding = originalPadding;
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const margin = 15;

        const contentWidthOnPdf = pdfWidth - margin * 2;
        const contentHeightOnPdf = (canvas.height * contentWidthOnPdf) / canvas.width;
        
        const pageContentHeight = pdfHeight - margin * 2;
        const totalPages = Math.ceil(contentHeightOnPdf / pageContentHeight);

        let heightLeft = contentHeightOnPdf;
        let position = 0;

        pdf.addImage(imgData, 'PNG', margin, margin, contentWidthOnPdf, contentHeightOnPdf);
        heightLeft -= pageContentHeight;

        let currentPage = 1;
        while (heightLeft > 0) {
            currentPage++;
            position -= pageContentHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', margin, position + margin, contentWidthOnPdf, contentHeightOnPdf);
            heightLeft -= pageContentHeight;
        }

        addHeaderAndFooter(pdf, totalPages);

        const safeTopic = mainTopic.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 30);
        pdf.save(`tom-tat-${safeTopic || 'on-tap'}.pdf`);
      });
    }
  };

  const formatTextForCopy = (data: SummaryData): string => {
    let text = `TỔNG QUAN CHỦ ĐỀ\n${data.topicOverview}\n\n`;
    text += `KHÁI NIỆM & LÝ THUYẾT CỐT LÕI\n${data.coreConcepts.map(c => `- ${c}`).join('\n')}\n\n`;
    if (data.keyFacts && data.keyFacts.length > 0) {
      text += `DỮ KIỆN/CON SỐ/NIÊN BIỂU\n${data.keyFacts.map(f => `- ${f}`).join('\n')}\n\n`;
    }
    if (data.formulas && data.formulas.length > 0) {
      text += `CÔNG THỨC/QUY TRÌNH\n${data.formulas.map(f => `- ${f}`).join('\n')}\n\n`;
    }
    text += `VÍ DỤ MINH HỌA\n${data.examples.map(e => `- ${e}`).join('\n')}\n\n`;
    text += `MẸO GHI NHỚ & LỖI DỄ NHẦM\n${data.memoryTips.map(t => `- ${t}`).join('\n')}\n\n`;
    text += `GỢI Ý ÔN TẬP\n${data.studySuggestions}\n\n`;

    if (data.practiceTest && data.practiceTest.length > 0) {
      text += `BÀI KIỂM TRA THAM KHẢO\n\n`;
      data.practiceTest.forEach((q, index) => {
        text += `Câu ${index + 1} (${q.type === 'mcq' ? 'Trắc nghiệm' : 'Tự luận'}): ${q.question}\n`;
        if (q.type === 'mcq' && q.options) {
          q.options.forEach(opt => {
            text += `- ${opt}\n`;
          });
        }
        text += `Đáp án: ${q.answer}\n`;
        text += `Giải thích: ${q.explanation}\n\n`;
      });
    }
    
    return text;
  };

  const handleCopy = () => {
    if (summaryData) {
      const textToCopy = formatTextForCopy(summaryData);
      navigator.clipboard.writeText(textToCopy).then(() => {
        setIsCopied(true);
      });
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
          <svg className="animate-spin h-10 w-10 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-lg font-semibold text-gray-700">AI đang biên soạn tóm tắt...</p>
          <p className="text-gray-500">Quá trình này có thể mất vài giây.</p>
        </div>
      );
    }
    if (error) {
      return <div className="text-center p-8 bg-red-50 text-red-700 rounded-lg">{error}</div>;
    }
    if (summaryData) {
      return (
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-blue-800">Bản tóm tắt ôn tập</h2>
            <div className="flex space-x-2">
              <button onClick={handleExportPdf} className="flex items-center space-x-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-3 rounded-lg transition">
                <PdfIcon />
                <span>Xuất PDF</span>
              </button>
              <button onClick={handleCopy} className="flex items-center space-x-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-3 rounded-lg transition">
                {isCopied ? <CheckIcon /> : <CopyIcon />}
                <span>{isCopied ? 'Đã chép' : 'Sao chép'}</span>
              </button>
            </div>
          </div>
          <div ref={summaryContentRef} className="space-y-6 printable-content">
            <SummarySection title="Tổng quan chủ đề">{summaryData.topicOverview}</SummarySection>
            <SummarySection title="Khái niệm & Lý thuyết cốt lõi" items={summaryData.coreConcepts} />
            {summaryData.keyFacts && summaryData.keyFacts.length > 0 && <SummarySection title="Dữ kiện/Con số/Niên biểu" items={summaryData.keyFacts} />}
            {summaryData.formulas && summaryData.formulas.length > 0 && <SummarySection title="Công thức/Quy trình" items={summaryData.formulas} />}
            <SummarySection title="Ví dụ minh họa" items={summaryData.examples} />
            <SummarySection title="Mẹo ghi nhớ & Lỗi dễ nhầm" items={summaryData.memoryTips} />
            <SummarySection title="Gợi ý ôn tập theo hình thức kiểm tra">{summaryData.studySuggestions}</SummarySection>
            {summaryData.practiceTest && summaryData.practiceTest.length > 0 && (
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold text-blue-700 mb-4">Bài kiểm tra tham khảo</h3>
                <div className="space-y-4">
                  {summaryData.practiceTest.map((q, index) => (
                    <PracticeQuestionCard key={index} question={q} index={index} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-700">Sẵn sàng để ôn tập!</h2>
        <p className="mt-2 text-gray-500 max-w-md">Điền thông tin vào biểu mẫu bên trái và nhấn "Tạo tóm tắt" để AI giúp bạn hệ thống hóa kiến thức một cách nhanh chóng.</p>
        <div className="mt-6 text-5xl text-blue-200">
          &#128218;
        </div>
      </div>
    );
  };

  return <div className="w-full">{renderContent()}</div>;
};

interface SummarySectionProps {
  title: string;
  children?: React.ReactNode;
  items?: string[];
}

const SummarySection: React.FC<SummarySectionProps> = ({ title, children, items }) => (
  <div className="border-t border-gray-200 pt-4">
    <h3 className="text-lg font-semibold text-blue-700 mb-2">{title}</h3>
    {children && <p className="text-gray-700 leading-relaxed">{children}</p>}
    {items && (
      <ul className="list-disc list-inside space-y-2 text-gray-700">
        {items.map((item, index) => <li key={index} dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></li>)}
      </ul>
    )}
  </div>
);

interface PracticeQuestionCardProps {
  question: PracticeQuestion;
  index: number;
}

const PracticeQuestionCard: React.FC<PracticeQuestionCardProps> = ({ question, index }) => {
  const [isAnswerVisible, setIsAnswerVisible] = useState(false);

  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50/50">
      <p className="font-semibold text-gray-800">
        <span className="text-blue-600 font-bold">Câu {index + 1}:</span> ({question.type === 'mcq' ? 'Trắc nghiệm' : 'Tự luận'}) {question.question}
      </p>
      {question.type === 'mcq' && question.options && (
        <ul className="list-none mt-3 space-y-2 pl-6">
          {question.options.map((opt, i) => (
            <li key={i} className="text-gray-700 before:content-['-'] before:mr-2">{opt}</li>
          ))}
        </ul>
      )}
      <div className="mt-4">
        <button
          onClick={() => setIsAnswerVisible(!isAnswerVisible)}
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          {isAnswerVisible ? 'Ẩn đáp án' : 'Xem đáp án & Giải thích'}
        </button>
      </div>
      {isAnswerVisible && (
        <div className="mt-3 p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg animate-fade-in">
          <p className="font-semibold text-green-700">
            <strong>Đáp án:</strong> {question.answer}
          </p>
          <div className="mt-2 text-gray-700 leading-relaxed prose prose-sm max-w-none">
            <strong>Giải thích:</strong>
            <p dangerouslySetInnerHTML={{ __html: question.explanation.replace(/\n/g, '<br />') }}></p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SummaryDisplay;