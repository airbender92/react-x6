import React, { useState } from'react';
import './index.css';

const Step = ({ label, active, onClick }) => {
  return (
    <div className={`step ${active? 'active' : ''}`} onClick={onClick}>
      {label}
    </div>
  );
};

const Steps = () => {
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Default', 'Primary', 'Success', 'Link', 'Info', 'Warning', 'Danger'];

  const handleStepClick = (index) => {
    setActiveStep(index);
  };

  return (
    <div className="steps">
      {steps.map((step, index) => (
        <Step
          key={index}
          label={step}
          active={index === activeStep}
          onClick={() => handleStepClick(index)}
        />
      ))}
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <Steps />
    </div>
  );
}

export default App;