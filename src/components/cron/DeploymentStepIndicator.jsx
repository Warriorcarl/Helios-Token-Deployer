import React from "react";

export default function DeploymentStepIndicator({ currentStep, completedSteps }) {
  const steps = [
    { number: 1, title: "Deploy Contract", description: "Deploy Simple Test Contract" },
    { number: 2, title: "Create Cron Job", description: "Configure cron job" }
  ];

  return (
    <div className="deployment-step-indicator">
      <div className="steps-container">
        {steps.map((step, index) => (
          <div key={step.number} className="step-item">
            <div className={`step-circle ${
              completedSteps.includes(step.number) ? 'completed' : 
              currentStep === step.number ? 'active' : 'pending'
            }`}>
              {completedSteps.includes(step.number) ? (
                <span className="step-check">✓</span>
              ) : (
                <span className="step-number">{step.number}</span>
              )}
            </div>
            
            <div className="step-content">
              <div className="step-title">{step.title}</div>
              <div className="step-description">{step.description}</div>
            </div>
            
            {index < steps.length - 1 && (
              <div className={`step-connector ${
                completedSteps.includes(step.number) ? 'completed' : 'pending'
              }`}></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}