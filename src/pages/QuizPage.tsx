
import MBAScholarshipQuiz from '@/components/MBAScholarshipQuiz';
import { useSearchParams } from 'react-router-dom';

const QuizPage = () => {
  const [searchParams] = useSearchParams();
  const applicationId = searchParams.get('applicationId');

  const handleClose = () => {
    // Navigate back to home page
    window.location.href = '/';
  };

  return <MBAScholarshipQuiz onClose={handleClose} applicationId={applicationId || undefined} />;
};

export default QuizPage;
