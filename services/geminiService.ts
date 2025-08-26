import { GoogleGenAI, Type } from "@google/genai";
import type { FormData, SummaryData } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const practiceQuestionSchema = {
  type: Type.OBJECT,
  properties: {
    type: {
      type: Type.STRING,
      enum: ['mcq', 'essay'],
      description: 'Loại câu hỏi: "mcq" cho trắc nghiệm hoặc "essay" cho tự luận.'
    },
    question: {
      type: Type.STRING,
      description: 'Nội dung của câu hỏi.'
    },
    options: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Danh sách các lựa chọn trả lời cho câu hỏi trắc nghiệm. Trả về mảng rỗng nếu là câu tự luận.'
    },
    answer: {
      type: Type.STRING,
      description: 'Đáp án đúng. Đối với trắc nghiệm, đây là nội dung của lựa chọn đúng. Đối với tự luận, đây là câu trả lời mẫu.'
    },
    explanation: {
      type: Type.STRING,
      description: 'Giải thích chi tiết và rõ ràng cho đáp án, giúp người học hiểu sâu hơn về kiến thức liên quan.'
    }
  },
  required: ['type', 'question', 'answer', 'explanation']
};


const responseSchema = {
  type: Type.OBJECT,
  properties: {
    topicOverview: {
      type: Type.STRING,
      description: 'Một đoạn văn ngắn (2-3 câu) tổng quan về chủ đề, nêu bật phạm vi và trọng tâm ôn tập chính.'
    },
    coreConcepts: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Danh sách các khái niệm, định nghĩa hoặc lý thuyết cốt lõi, trình bày dưới dạng gạch đầu dòng. In đậm (sử dụng markdown **text**) các thuật ngữ quan trọng.'
    },
    keyFacts: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Danh sách các dữ kiện, con số, hoặc mốc thời gian quan trọng (nếu có). Trả về mảng rỗng nếu không áp dụng.'
    },
    formulas: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Danh sách các công thức, phương trình hoặc quy trình chính (nếu có). Trả về mảng rỗng nếu không áp dụng.'
    },
    examples: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Một vài ví dụ minh họa ngắn gọn, dễ hiểu để làm rõ các khái niệm hoặc công thức.'
    },
    memoryTips: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Danh sách các mẹo ghi nhớ, câu thần chú, hoặc chỉ ra các lỗi sai phổ biến mà học sinh thường mắc phải.'
    },
    studySuggestions: {
      type: Type.STRING,
      description: 'Một đoạn văn ngắn đưa ra gợi ý về cách ôn tập hiệu quả dựa trên cấu trúc kiểm tra đã cho (số lượng câu Trắc nghiệm và Tự luận).'
    },
    practiceTest: {
      type: Type.ARRAY,
      items: practiceQuestionSchema,
      description: `Một bài kiểm tra tham khảo bao gồm các câu hỏi trắc nghiệm và tự luận. Mỗi câu hỏi phải có đáp án và giải thích chi tiết.`
    }
  },
  required: ['topicOverview', 'coreConcepts', 'examples', 'memoryTips', 'studySuggestions', 'practiceTest']
};

export const generateSummary = async (formData: FormData): Promise<SummaryData> => {
  const { subject, grade, textbook, mainTopic, learningObjectives, mcqCount, essayCount, mcqDifficulty } = formData;
  
  const totalQuestions = mcqCount + essayCount;

  const prompt = `
    Bối cảnh:
    - Môn học: ${subject}
    - Lớp: ${grade}
    - Bộ sách: ${textbook}
    - Chủ đề chính: ${mainTopic}
    - Cấu trúc bài kiểm tra dự kiến: ${mcqCount} câu trắc nghiệm và ${essayCount} câu tự luận (tổng cộng ${totalQuestions} câu).
    - Độ khó câu trắc nghiệm (MCQ): ${mcqDifficulty}
    - Mục tiêu học tập cần đạt:
    ${learningObjectives}

    Yêu cầu:
    Với vai trò là một chuyên gia biên soạn nội dung giáo dục, hãy tạo một bản tóm tắt ôn tập chi tiết VÀ một bài kiểm tra tham khảo. Nội dung cần bám sát kiến thức từ bộ sách "${textbook}" nếu có thể.

    1.  **Bản tóm tắt ôn tập**: Phải súc tích, có cấu trúc, chính xác về mặt kiến thức, logic, dễ hiểu và bám sát các mục tiêu học tập đã đề ra. Phần "Gợi ý ôn tập" cần đưa ra lời khuyên phù hợp với cấu trúc kiểm tra đã cho.
    2.  **Bài kiểm tra tham khảo (practiceTest)**: Tạo chính xác ${mcqCount} câu hỏi trắc nghiệm và ${essayCount} câu hỏi tự luận dựa trên chủ đề và mục tiêu học tập. Các câu hỏi trắc nghiệm phải tuân thủ nghiêm ngặt độ khó đã yêu cầu là "${mcqDifficulty}". Mỗi câu hỏi phải có đáp án đúng và phần giải thích chi tiết, rõ ràng để giúp người học củng cố kiến thức.

    Hãy đảm bảo toàn bộ nội dung phù hợp với cấp học và bộ sách được cung cấp, và trả về kết quả theo đúng schema JSON đã định nghĩa.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.5,
      },
    });

    const jsonText = response.text.trim();
    const parsedData: SummaryData = JSON.parse(jsonText);
    return parsedData;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Không thể tạo tóm tắt. Đã có lỗi xảy ra từ API.");
  }
};

export const generateTopicSuggestion = async (subject: string, grade: string, textbook: string): Promise<string> => {
  const prompt = `
    Dựa trên thông tin sau:
    - Môn học: ${subject}
    - Lớp: ${grade}
    - Bộ sách: ${textbook}

    Hãy gợi ý MỘT chủ đề học tập chính phù hợp.
    
    Yêu cầu quan trọng: Chỉ trả về TÊN CHỦ ĐỀ, không thêm bất kỳ lời giải thích, định dạng, hay ký tự đặc biệt nào (ví dụ: không có dấu ngoặc kép, dấu gạch đầu dòng).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.7,
      },
    });
    
    // Clean up response to ensure only the topic text is returned.
    // This removes potential list prefixes, surrounding quotes, and markdown bolding.
    return response.text
      .trim()
      .replace(/^"|"$/g, '')      // Remove surrounding double quotes
      .replace(/^- /, '')         // Remove leading list marker
      .replace(/^\*\*|\*\*$/g, ''); // Remove surrounding bold markers
  } catch (error) {
    console.error("Error calling Gemini API for suggestion:", error);
    throw new Error("Không thể tạo gợi ý.");
  }
};

export const generateObjectivesSuggestion = async (subject: string, grade: string, textbook: string, mainTopic: string): Promise<string> => {
  const prompt = `
    Dựa trên thông tin sau:
    - Môn học: ${subject}
    - Lớp: ${grade}
    - Bộ sách: ${textbook}
    - Chủ đề chính: "${mainTopic}"

    Hãy gợi ý 3-4 mục tiêu học tập cốt lõi mà một học sinh cần đạt được cho chủ đề này.

    Yêu cầu quan trọng:
    - Trả về kết quả dưới dạng danh sách.
    - Mỗi mục tiêu bắt đầu bằng một dấu gạch ngang và một khoảng trắng ("- ").
    - Không thêm bất kỳ lời giải thích, tiêu đề, hay định dạng nào khác.
    
    Ví dụ:
    - Nắm vững bối cảnh, diễn biến chính và kết quả.
    - Phân tích được ý nghĩa lịch sử.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.6,
      },
    });
    
    return response.text.trim();
  } catch (error) {
    console.error("Error calling Gemini API for objectives suggestion:", error);
    throw new Error("Không thể tạo gợi ý mục tiêu học tập.");
  }
};