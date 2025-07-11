
import MBAScholarshipQuiz from '@/components/MBAScholarshipQuiz';

const QuizPage = () => {
  const handleClose = () => {
    // Navigate back to home page
    window.location.href = '/';
  };

  return <MBAScholarshipQuiz onClose={handleClose} />;
};

export default QuizPage;
