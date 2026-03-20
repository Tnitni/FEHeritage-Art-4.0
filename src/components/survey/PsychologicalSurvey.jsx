import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PsychologicalSurvey = ({
  courseId,
  phase, // 'pre', 'mid', 'post'
  onComplete,
  isOpen,
  onClose
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Câu hỏi cho từng giai đoạn
  const questionsByPhase = {
    pre: [
      {
        id: 'motivation_level',
        type: 'scale',
        question: 'Mức độ hứng thú của bạn với khóa học này?',
        scale: { min: 1, max: 5, labels: ['Rất thấp', 'Thấp', 'Trung bình', 'Cao', 'Rất cao'] }
      },
      {
        id: 'confidence_level',
        type: 'scale',
        question: 'Bạn tự tin như thế nào về khả năng hoàn thành khóa học?',
        scale: { min: 1, max: 5, labels: ['Rất không tự tin', 'Không tự tin', 'Bình thường', 'Tự tin', 'Rất tự tin'] }
      },
      {
        id: 'prior_knowledge',
        type: 'scale',
        question: 'Kiến thức nền tảng của bạn về chủ đề này?',
        scale: { min: 1, max: 5, labels: ['Rất ít', 'Ít', 'Trung bình', 'Nhiều', 'Rất nhiều'] }
      },
      {
        id: 'learning_goals',
        type: 'multiple',
        question: 'Mục tiêu học tập chính của bạn? (Chọn nhiều đáp án)',
        options: [
          'Nắm vững kiến thức cơ bản',
          'Phát triển kỹ năng thực hành',
          'Ứng dụng vào công việc',
          'Thỏa mãn sự tò mò',
          'Chuẩn bị cho kỳ thi'
        ]
      },
      {
        id: 'preferred_style',
        type: 'single',
        question: 'Phương pháp học tập bạn thích nhất?',
        options: [
          'Học qua video và hình ảnh',
          'Đọc tài liệu và ghi chú',
          'Thực hành và làm bài tập',
          'Thảo luận nhóm',
          'Học một mình'
        ]
      },
      {
        id: 'concerns',
        type: 'text',
        question: 'Bạn có lo lắng gì về khóa học này không? (Tùy chọn)',
        placeholder: 'Chia sẻ những lo lắng hoặc khó khăn bạn dự đoán...'
      }
    ],
    mid: [
      {
        id: 'understanding_level',
        type: 'scale',
        question: 'Mức độ hiểu bài của bạn đến hiện tại?',
        scale: { min: 1, max: 5, labels: ['Rất khó hiểu', 'Khó hiểu', 'Bình thường', 'Dễ hiểu', 'Rất dễ hiểu'] }
      },
      {
        id: 'pace_comfort',
        type: 'single',
        question: 'Nhịp độ học tập hiện tại như thế nào với bạn?',
        options: ['Quá nhanh', 'Hơi nhanh', 'Vừa phải', 'Hơi chậm', 'Quá chậm']
      },
      {
        id: 'difficulty_areas',
        type: 'multiple',
        question: 'Phần nào bạn cảm thấy khó khăn nhất? (Chọn nhiều đáp án)',
        options: [
          'Hiểu khái niệm lý thuyết',
          'Áp dụng vào thực hành',
          'Ghi nhớ thông tin',
          'Tập trung trong học tập',
          'Quản lý thời gian học',
          'Không có khó khăn đặc biệt'
        ]
      },
      {
        id: 'engagement_level',
        type: 'scale',
        question: 'Mức độ tham gia tích cực của bạn trong học tập?',
        scale: { min: 1, max: 5, labels: ['Rất thấp', 'Thấp', 'Trung bình', 'Cao', 'Rất cao'] }
      },
      {
        id: 'support_needed',
        type: 'multiple',
        question: 'Bạn cần hỗ trợ gì để học tốt hơn?',
        options: [
          'Giải thích thêm về lý thuyết',
          'Nhiều ví dụ thực tế hơn',
          'Bài tập thực hành',
          'Thảo luận với bạn học',
          'Hỗ trợ từ giảng viên',
          'Tài liệu tham khảo thêm'
        ]
      },
      {
        id: 'stress_level',
        type: 'scale',
        question: 'Mức độ căng thẳng khi học khóa này?',
        scale: { min: 1, max: 5, labels: ['Không căng thẳng', 'Ít căng thẳng', 'Bình thường', 'Hơi căng thẳng', 'Rất căng thẳng'] }
      }
    ],
    post: [
      {
        id: 'satisfaction_level',
        type: 'scale',
        question: 'Mức độ hài lòng về khóa học?',
        scale: { min: 1, max: 5, labels: ['Rất không hài lòng', 'Không hài lòng', 'Bình thường', 'Hài lòng', 'Rất hài lòng'] }
      },
      {
        id: 'knowledge_gained',
        type: 'scale',
        question: 'Bạn cảm thấy đã học được bao nhiều kiến thức?',
        scale: { min: 1, max: 5, labels: ['Rất ít', 'Ít', 'Trung bình', 'Nhiều', 'Rất nhiều'] }
      },
      {
        id: 'goals_achieved',
        type: 'scale',
        question: 'Mức độ đạt được mục tiêu ban đầu?',
        scale: { min: 1, max: 5, labels: ['Không đạt', 'Đạt ít', 'Đạt một phần', 'Đạt nhiều', 'Đạt hoàn toàn'] }
      },
      {
        id: 'application_confidence',
        type: 'scale',
        question: 'Bạn tự tin áp dụng kiến thức đã học như thế nào?',
        scale: { min: 1, max: 5, labels: ['Rất không tự tin', 'Không tự tin', 'Bình thường', 'Tự tin', 'Rất tự tin'] }
      },
      {
        id: 'most_valuable',
        type: 'single',
        question: 'Phần nào của khóa học có giá trị nhất với bạn?',
        options: [
          'Kiến thức lý thuyết cơ bản',
          'Ví dụ và case study thực tế',
          'Bài tập thực hành',
          'Tương tác với giảng viên',
          'Thảo luận với bạn học'
        ]
      },
      {
        id: 'improvements',
        type: 'multiple',
        question: 'Khóa học nên cải thiện gì? (Chọn nhiều đáp án)',
        options: [
          'Nội dung chi tiết hơn',
          'Nhiều ví dụ thực tế',
          'Bài tập đa dạng hơn',
          'Tương tác nhiều hơn',
          'Tài liệu phong phú hơn',
          'Thời gian học hợp lý hơn',
          'Không cần cải thiện'
        ]
      },
      {
        id: 'recommendation',
        type: 'scale',
        question: 'Bạn có khuyến khích người khác tham gia khóa học này không?',
        scale: { min: 1, max: 5, labels: ['Chắc chắn không', 'Có thể không', 'Không chắc', 'Có thể có', 'Chắc chắn có'] }
      },
      {
        id: 'feedback',
        type: 'text',
        question: 'Góp ý thêm cho khóa học (Tùy chọn)',
        placeholder: 'Chia sẻ ý kiến, đánh giá chi tiết về khóa học...'
      }
    ]
  };

  const currentQuestions = questionsByPhase[phase] || [];
  const totalQuestions = currentQuestions.length;

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const surveyData = {
      courseId,
      phase,
      answers,
      timestamp: new Date().toISOString(),
      userId: 'current-user-id' // Thay bằng user ID thật
    };

    try {
      // Gọi API để lưu dữ liệu khảo sát
      const response = await fetch('survey/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(surveyData)
      });

      if (response.ok) {
        const result = await response.json();
        onComplete(result);
      }
    } catch (error) {
      console.error('Error submitting survey:', error);
      // Fallback: trả về dữ liệu mock
      onComplete({
        id: Date.now(),
        ...surveyData,
        aiAnalysis: generateMockAnalysis(surveyData)
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateMockAnalysis = (data) => {
    // Mock AI analysis dựa trên phase
    const analysisTemplates = {
      pre: {
        summary: 'Học sinh thể hiện mức độ hứng thú tốt với khóa học. Cần hỗ trợ xây dựng sự tự tin.',
        recommendations: [
          'Cung cấp tài liệu chuẩn bị trước khóa học',
          'Giới thiệu cấu trúc khóa học chi tiết',
          'Tạo nhóm học tập hỗ trợ'
        ],
        riskFactors: ['Mức độ tự tin thấp', 'Thiếu kiến thức nền tảng']
      },
      mid: {
        summary: 'Học sinh đang gặp một số khó khăn trong việc tiếp thu bài học. Cần điều chỉnh phương pháp.',
        recommendations: [
          'Giảm tốc độ truyền đạt kiến thức',
          'Tăng cường ví dụ thực tế',
          'Tổ chức buổi hỗ trợ thêm'
        ],
        riskFactors: ['Khó khăn trong hiểu lý thuyết', 'Mức độ căng thẳng cao']
      },
      post: {
        summary: 'Học sinh hoàn thành khóa học với mức độ hài lòng tốt. Có thể áp dụng kiến thức vào thực tế.',
        recommendations: [
          'Cung cấp tài liệu tham khảo nâng cao',
          'Kết nối với cơ hội thực tập',
          'Theo dõi quá trình áp dụng kiến thức'
        ],
        riskFactors: []
      }
    };

    return analysisTemplates[data.phase] || analysisTemplates.post;
  };

  const renderQuestion = (question) => {
    const answer = answers[question.id];

    switch (question.type) {
      case 'scale':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              {question.scale.labels.map((label, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(question.id, index + 1)}
                  className={`flex flex-col items-center p-3 rounded-lg transition-all ${
                    answer === index + 1
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <span className="text-2xl font-bold mb-1">{index + 1}</span>
                  <span className="text-xs text-center">{label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 'single':
        return (
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(question.id, option)}
                className={`w-full p-4 text-left rounded-lg border transition-all ${
                  answer === option
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        );

      case 'multiple':
        return (
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => {
                  const currentAnswers = answer || [];
                  const newAnswers = currentAnswers.includes(option)
                    ? currentAnswers.filter(a => a !== option)
                    : [...currentAnswers, option];
                  handleAnswer(question.id, newAnswers);
                }}
                className={`w-full p-4 text-left rounded-lg border transition-all ${
                  (answer || []).includes(option)
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-5 h-5 mr-3 border-2 rounded ${
                    (answer || []).includes(option)
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {(answer || []).includes(option) && (
                      <svg className="w-3 h-3 text-white mx-auto mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  {option}
                </div>
              </button>
            ))}
          </div>
        );

      case 'text':
        return (
          <textarea
            value={answer || ''}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            placeholder={question.placeholder}
            className="w-full p-4 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            rows={4}
          />
        );

      default:
        return null;
    }
  };

  const getPhaseTitle = () => {
    switch (phase) {
      case 'pre': return 'Khảo sát trước khóa học';
      case 'mid': return 'Khảo sát giữa khóa học';
      case 'post': return 'Khảo sát sau khóa học';
      default: return 'Khảo sát học tập';
    }
  };

  const getPhaseDescription = () => {
    switch (phase) {
      case 'pre':
        return 'Giúp chúng tôi hiểu mong đợi và chuẩn bị của bạn cho khóa học này.';
      case 'mid':
        return 'Đánh giá quá trình học tập để điều chỉnh phương pháp phù hợp.';
      case 'post':
        return 'Phản hồi về trải nghiệm học tập để cải thiện khóa học.';
      default:
        return 'Khảo sát tâm lý học tập.';
    }
  };

  if (!isOpen) return null;

  const currentQuestionData = currentQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">{getPhaseTitle()}</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-gray-600 mb-4">{getPhaseDescription()}</p>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span>Câu hỏi {currentQuestion + 1} / {totalQuestions}</span>
              <span>{Math.round(progress)}% hoàn thành</span>
            </div>
          </div>

          {/* Question Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-6">
                  {currentQuestionData?.question}
                </h3>
                {renderQuestion(currentQuestionData)}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Câu trước
            </button>

            <div className="flex gap-3">
              {currentQuestion === totalQuestions - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-8 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? 'Đang gửi...' : 'Hoàn thành'}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Câu tiếp theo
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PsychologicalSurvey;
