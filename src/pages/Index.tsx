import MBALanding from './MBALanding';

const Index = () => {
  // Check for resetTimer URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const resetTimer = urlParams.get('resetTimer') === 'true';

  return <MBALanding resetTimer={resetTimer} />;
};

export default Index;
