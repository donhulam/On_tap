import React from 'react';
import type { FormData } from '../types';
import { SUBJECTS, GRADES, TEXTBOOKS } from '../constants';
import { GenerateIcon, SuggestIcon } from './icons';

interface InputFormProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction< FormData >>;
  onSubmit: () => void;
  isLoading: boolean;
  isSuggesting: boolean;
  onSuggestTopic: () => void;
  isSuggestingObjectives: boolean;
  onSuggestObjectives: () => void;
}

const MCQ_DIFFICULTY_LEVELS = ['Dễ', 'Trung bình', 'Khó', 'Tổng hợp'];

const InputForm: React.FC<InputFormProps> = ({ 
  formData, 
  setFormData, 
  onSubmit, 
  isLoading, 
  isSuggesting, 
  onSuggestTopic,
  isSuggestingObjectives,
  onSuggestObjectives 
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'mcqCount' || name === 'essayCount') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value, 10) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 sticky top-24">
      <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-3">Thông tin ôn tập</h2>
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-5">
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Môn học</label>
          <input
            type="text"
            id="subject"
            name="subject"
            list="subject-list"
            value={formData.subject}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="Chọn hoặc nhập môn học"
          />
          <datalist id="subject-list">
            {SUBJECTS.map(s => <option key={s} value={s} />)}
          </datalist>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">Cấp/Lớp</label>
            <select id="grade" name="grade" value={formData.grade} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition">
              {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="textbook" className="block text-sm font-medium text-gray-700 mb-1">Bộ sách</label>
            <select id="textbook" name="textbook" value={formData.textbook} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition">
              {TEXTBOOKS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="mainTopic" className="block text-sm font-medium text-gray-700">Chủ đề chính</label>
            <button
              type="button"
              onClick={onSuggestTopic}
              disabled={isSuggesting}
              className="flex items-center text-xs font-medium text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isSuggesting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang tìm...
                </>
              ) : (
                <>
                  <SuggestIcon />
                  Gợi ý
                </>
              )}
            </button>
          </div>
          <textarea id="mainTopic" name="mainTopic" value={formData.mainTopic} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition" placeholder="Ví dụ: Quang hợp ở thực vật"></textarea>
        </div>
        
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
          <h3 className="text-sm font-medium text-gray-800">Cấu trúc bài kiểm tra</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="mcqCount" className="block text-sm font-medium text-gray-700 mb-1">Số câu trắc nghiệm</label>
              <input
                id="mcqCount"
                name="mcqCount"
                type="number"
                min="0"
                step="1"
                value={formData.mcqCount}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>
             <div>
              <label htmlFor="mcqDifficulty" className="block text-sm font-medium text-gray-700 mb-1">Độ khó</label>
               <select 
                id="mcqDifficulty" 
                name="mcqDifficulty" 
                value={formData.mcqDifficulty} 
                onChange={handleChange} 
                disabled={formData.mcqCount === 0}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-gray-100 disabled:cursor-not-allowed">
                {MCQ_DIFFICULTY_LEVELS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label htmlFor="essayCount" className="block text-sm font-medium text-gray-700 mb-1">Số câu tự luận</label>
              <input
                id="essayCount"
                name="essayCount"
                type="number"
                min="0"
                step="1"
                value={formData.essayCount}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="learningObjectives" className="block text-sm font-medium text-gray-700">Mục tiêu học tập</label>
            <button
              type="button"
              onClick={onSuggestObjectives}
              disabled={isSuggestingObjectives || !formData.mainTopic}
              className="flex items-center text-xs font-medium text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
              title={!formData.mainTopic ? "Vui lòng nhập chủ đề chính trước" : "Gợi ý mục tiêu học tập"}
            >
              {isSuggestingObjectives ? (
                <>
                  <svg className="animate-spin -ml-1 mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang tìm...
                </>
              ) : (
                <>
                  <SuggestIcon />
                  Gợi ý
                </>
              )}
            </button>
          </div>
          <textarea id="learningObjectives" name="learningObjectives" value={formData.learningObjectives} onChange={handleChange} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition" placeholder="Liệt kê các mục tiêu cần đạt, mỗi mục tiêu một dòng"></textarea>
        </div>

        <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed transition-all duration-300 ease-in-out">
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Đang xử lý...
            </>
          ) : (
            <>
              <GenerateIcon />
              Tạo tóm tắt
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default InputForm;