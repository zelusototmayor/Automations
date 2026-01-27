'use client';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  onStepClick?: (step: number) => void;
}

const STEP_LABELS = [
  'Identity',
  'Personality',
  'Expertise',
  'Knowledge',
  'Model',
  'Preview',
];

export function StepIndicator({ currentStep, totalSteps, onStepClick }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <div key={step} className="flex items-center">
          <button
            onClick={() => onStepClick?.(step)}
            disabled={step > currentStep}
            className={`flex flex-col items-center ${
              step <= currentStep ? 'cursor-pointer' : 'cursor-not-allowed'
            }`}
          >
            <div
              className={`step-circle ${
                step < currentStep
                  ? 'step-circle-completed'
                  : step === currentStep
                  ? 'step-circle-active'
                  : 'step-circle-pending'
              }`}
            >
              {step < currentStep ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                step
              )}
            </div>
            <span
              className={`text-[12px] mt-1.5 hidden sm:block ${
                step === currentStep
                  ? 'font-medium'
                  : ''
              }`}
              style={{
                color: step === currentStep ? 'var(--cta-start)' : 'var(--text-placeholder)'
              }}
            >
              {STEP_LABELS[step - 1]}
            </span>
          </button>

          {step < totalSteps && (
            <div
              className={`w-8 sm:w-16 mx-1 ${
                step < currentStep
                  ? 'step-connector-completed'
                  : 'step-connector'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
