import React, { useState } from 'react';
import type { FormData, SummaryData } from './types';
import InputForm from './components/InputForm';
import SummaryDisplay from './components/SummaryDisplay';
import { generateSummary, generateTopicSuggestion, generateObjectivesSuggestion } from './services/geminiService';

function App(): React.ReactNode {
  const [formData, setFormData] = useState<FormData>({
    subject: 'Lịch sử',
    grade: 'Lớp 12',
    textbook: 'Cánh Diều',
    mainTopic: 'Chiến dịch Hồ Chí Minh lịch sử',
    learningObjectives: '- Nắm vững bối cảnh, diễn biến chính và kết quả của chiến dịch.\n- Phân tích được ý nghĩa lịch sử của chiến dịch.',
    mcqCount: 16,
    essayCount: 4,
    mcqDifficulty: 'Trung bình',
  });
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuggesting, setIsSuggesting] = useState<boolean>(false);
  const [isSuggestingObjectives, setIsSuggestingObjectives] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    setSummaryData(null);
    try {
      const result = await generateSummary(formData);
      setSummaryData(result);
    } catch (err) {
      console.error(err);
      setError('Đã xảy ra lỗi khi tạo tóm tắt. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestTopic = async () => {
    setIsSuggesting(true);
    try {
      const { subject, grade, textbook } = formData;
      const suggestion = await generateTopicSuggestion(subject, grade, textbook);
      setFormData(prev => ({ ...prev, mainTopic: suggestion }));
    } catch (err) {
      console.error(err);
      alert('Không thể tải gợi ý. Vui lòng thử lại.');
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleSuggestObjectives = async () => {
    if (!formData.mainTopic) {
      alert('Vui lòng nhập Chủ đề chính trước khi nhận gợi ý Mục tiêu học tập.');
      return;
    }
    setIsSuggestingObjectives(true);
    try {
      const { subject, grade, textbook, mainTopic } = formData;
      const suggestion = await generateObjectivesSuggestion(subject, grade, textbook, mainTopic);
      setFormData(prev => ({ ...prev, learningObjectives: suggestion }));
    } catch (err) {
      console.error(err);
      alert('Không thể tải gợi ý. Vui lòng thử lại.');
    } finally {
      setIsSuggestingObjectives(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-700">
            Trợ lý ôn tập AI
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Tóm tắt ghi chép học tập hiệu quả</p>
        </div>
      </header>
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-1/3 lg:max-w-md">
            <InputForm 
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              isSuggesting={isSuggesting}
              onSuggestTopic={handleSuggestTopic}
              isSuggestingObjectives={isSuggestingObjectives}
              onSuggestObjectives={handleSuggestObjectives}
            />
          </aside>
          
          <section className="w-full lg:w-2/3">
            <SummaryDisplay
              summaryData={summaryData}
              isLoading={isLoading}
              error={error}
              mainTopic={formData.mainTopic}
            />
          </section>
        </div>
      </main>

      <footer className="text-center py-4 text-gray-500 text-sm">
        <p>Phát triển bởi AI Engineer. Cung cấp bởi Gemini API.</p>
      </footer>
    </div>
  );
}

export default App;