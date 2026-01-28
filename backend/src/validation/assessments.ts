import { z } from 'zod';

// Assessment question type enum
export const assessmentQuestionTypeSchema = z.enum(['scale_1_10', 'multiple_choice', 'open_text']);

// Assessment trigger type enum
export const assessmentTriggerTypeSchema = z.enum(['first_message', 'on_demand', 'scheduled']);

// Assessment question schema
export const assessmentQuestionSchema = z.object({
  id: z.string().uuid(),
  text: z.string().min(1).max(500),
  type: assessmentQuestionTypeSchema,
  options: z.array(z.string().min(1).max(200)).max(10).optional(),
  category: z.string().max(100).optional(),
  required: z.boolean().optional().default(true),
}).refine(
  (data) => {
    // Multiple choice must have options
    if (data.type === 'multiple_choice' && (!data.options || data.options.length < 2)) {
      return false;
    }
    return true;
  },
  { message: 'Multiple choice questions must have at least 2 options' }
);

// Assessment config schema (for creating/updating)
export const assessmentConfigSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  triggerType: assessmentTriggerTypeSchema,
  questions: z.array(assessmentQuestionSchema).min(1).max(20),
});

// Assessment config without id (for creation, id will be generated)
export const createAssessmentConfigSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  triggerType: assessmentTriggerTypeSchema,
  questions: z.array(
    z.object({
      id: z.string().uuid().optional(), // Optional, will be generated if missing
      text: z.string().min(1).max(500),
      type: assessmentQuestionTypeSchema,
      options: z.array(z.string().min(1).max(200)).max(10).optional(),
      category: z.string().max(100).optional(),
      required: z.boolean().optional().default(true),
    })
  ).min(1).max(20),
});

// Assessment response submission schema
export const assessmentResponseSchema = z.object({
  answers: z.record(
    z.string(), // questionId
    z.union([z.string(), z.number()]) // answer value
  ),
});

// Types inferred from schemas
export type AssessmentQuestionType = z.infer<typeof assessmentQuestionTypeSchema>;
export type AssessmentTriggerType = z.infer<typeof assessmentTriggerTypeSchema>;
export type AssessmentQuestion = z.infer<typeof assessmentQuestionSchema>;
export type AssessmentConfig = z.infer<typeof assessmentConfigSchema>;
export type CreateAssessmentConfig = z.infer<typeof createAssessmentConfigSchema>;
export type AssessmentResponseInput = z.infer<typeof assessmentResponseSchema>;
