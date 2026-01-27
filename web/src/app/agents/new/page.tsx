'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { useAuthStore } from '@/lib/store';
import { useCreatorStore } from '@/lib/creatorStore';
import { agentsApi, ApiError } from '@/lib/api';
import { StepIndicator } from '@/components/creator/StepIndicator';
import { Step1Identity } from '@/components/creator/Step1Identity';
import { Step2Personality } from '@/components/creator/Step2Personality';
import { Step3Expertise } from '@/components/creator/Step3Expertise';
import { Step4Knowledge } from '@/components/creator/Step4Knowledge';
import { Step5Model } from '@/components/creator/Step5Model';
import { Step6Preview } from '@/components/creator/Step6Preview';

export default function NewAgentPage() {
  const router = useRouter();
  const { accessToken } = useAuthStore();
  const {
    draft,
    currentStep,
    totalSteps,
    isSaving,
    isPublishing,
    editingAgentId,
    setStep,
    nextStep,
    prevStep,
    resetDraft,
    setIsSaving,
    setIsPublishing,
    setEditingAgentId,
    generateSystemPrompt,
  } = useCreatorStore();

  const [error, setError] = useState('');

  // Reset draft when mounting
  useEffect(() => {
    resetDraft();
  }, []);

  // Validation per step
  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!draft.name && !!draft.tagline && !!draft.category;
      case 2:
        return true; // Personality has defaults
      case 3:
        return true; // Expertise is optional
      case 4:
        return true; // Knowledge is optional
      case 5:
        return !!draft.greetingMessage && !!draft.modelConfig.model;
      case 6:
        return true; // Preview step
      default:
        return false;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Create Your Coach';
      case 2:
        return 'Define Personality';
      case 3:
        return 'Set Expertise & Boundaries';
      case 4:
        return 'Add Knowledge';
      case 5:
        return 'Configure Model';
      case 6:
        return 'Preview & Publish';
      default:
        return '';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 1:
        return 'Give your AI coach an identity';
      case 2:
        return 'How should your coach interact with users?';
      case 3:
        return 'Define what your coach knows and its limits';
      case 4:
        return 'Give your coach more context with documents';
      case 5:
        return 'Choose the AI model and customize behavior';
      case 6:
        return 'Test your coach and publish when ready';
      default:
        return '';
    }
  };

  const handleSaveDraft = async () => {
    if (!accessToken) return;

    setIsSaving(true);
    setError('');

    try {
      const systemPrompt = draft.systemPrompt || generateSystemPrompt();

      // Convert knowledge documents to the format expected by the backend
      const knowledgeContext = draft.knowledgeDocuments
        .filter((doc) => doc.status === 'ready' && doc.content)
        .map((doc) => ({
          type: doc.type,
          title: doc.name,
          content: doc.content!,
          url: doc.url,
          fileName: doc.fileName,
        }));

      const agentData = {
        name: draft.name,
        tagline: draft.tagline,
        description: draft.description,
        avatar_url: draft.avatar,
        category: draft.category,
        tags: draft.tags,
        personality_config: draft.personalityConfig,
        model_config: draft.modelConfig,
        system_prompt: systemPrompt,
        greeting_message: draft.greetingMessage,
        conversation_starters: draft.conversationStarters.filter(Boolean),
        example_conversations: draft.exampleConversations.filter(
          (e) => e.user && e.assistant
        ),
        knowledge_context: knowledgeContext,
      };

      let result;
      if (editingAgentId) {
        result = await agentsApi.updateAgent(editingAgentId, agentData, accessToken);
      } else {
        result = await agentsApi.createAgent(agentData, accessToken);
        setEditingAgentId(result.agent.id);
      }

      return result.agent.id;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to save agent');
      }
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!accessToken) return;

    setIsPublishing(true);
    setError('');

    try {
      // Save first
      const agentId = await handleSaveDraft();
      if (!agentId) return;

      // Then publish
      await agentsApi.publishAgent(agentId, accessToken);

      // Navigate to the agent's knowledge page
      router.push(`/agents/${agentId}/knowledge`);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to publish agent');
      }
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSaveAndExit = async () => {
    try {
      await handleSaveDraft();
      router.push('/dashboard');
    } catch {
      // Error already set
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Identity />;
      case 2:
        return <Step2Personality />;
      case 3:
        return <Step3Expertise />;
      case 4:
        return <Step4Knowledge />;
      case 5:
        return <Step5Model />;
      case 6:
        return <Step6Preview />;
      default:
        return null;
    }
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="heading-section">
            {getStepTitle()}
          </h1>
          <p className="body-text mt-1">
            {getStepDescription()}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard"
            className="btn btn-secondary"
          >
            Cancel
          </Link>
          {currentStep > 1 && (
            <button
              onClick={handleSaveAndExit}
              disabled={isSaving}
              className="btn btn-secondary"
            >
              {isSaving ? 'Saving...' : 'Save & Exit'}
            </button>
          )}
        </div>
      </div>

      {/* Step Indicator */}
      <div className="mb-8">
        <StepIndicator
          currentStep={currentStep}
          totalSteps={totalSteps}
          onStepClick={(step) => step < currentStep && setStep(step)}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-error mb-6">
          {error}
        </div>
      )}

      {/* Step Content */}
      <div className="card p-6 mb-6">{renderStep()}</div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className={`btn btn-secondary ${
            currentStep === 1 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          Back
        </button>

        <div className="flex gap-2">
          {currentStep === totalSteps ? (
            <>
              <button
                onClick={handleSaveDraft}
                disabled={isSaving || isPublishing}
                className="btn btn-secondary"
              >
                {isSaving ? 'Saving...' : 'Save Draft'}
              </button>
              <button
                onClick={handlePublish}
                disabled={isSaving || isPublishing || !canProceed()}
                className="btn btn-primary"
              >
                {isPublishing ? 'Publishing...' : 'Publish Agent'}
              </button>
            </>
          ) : (
            <button
              onClick={nextStep}
              disabled={!canProceed()}
              className={`btn btn-primary ${
                !canProceed() ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
