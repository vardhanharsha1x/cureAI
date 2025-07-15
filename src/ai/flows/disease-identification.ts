// This is an AI-powered health assistant, DO NOT use as a replacement for medical advice.
'use server';

/**
 * @fileOverview Disease Identification AI agent.
 *
 * - identifyDisease - A function that handles the disease identification process.
 * - IdentifyDiseaseInput - The input type for the identifyDisease function.
 * - IdentifyDiseaseOutput - The return type for the identifyDisease function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdentifyDiseaseInputSchema = z.object({
  symptom1: z.string().describe('Symptom 1 selected by the user. "none" if not provided.'),
  symptom2: z.string().describe('Symptom 2 selected by the user. "none" if not provided.'),
  symptom3: z.string().describe('Symptom 3 selected by the user. "none" if not provided.'),
  symptom4: z.string().describe('Symptom 4 selected by the user. "none" if not provided.'),
  symptom5: z.string().describe('Symptom 5 selected by the user. "none" if not provided.'),
});
export type IdentifyDiseaseInput = z.infer<typeof IdentifyDiseaseInputSchema>;

const IdentifyDiseaseOutputSchema = z.object({
  disease: z.string().describe('The most likely disease or illness based on the symptoms.'),
  confidence: z.number().describe('A confidence score (0-1) indicating the certainty of the diagnosis.'),
  reasoning: z.string().describe('Explanation of why the AI model identified the disease based on the symptoms provided.'),
});
export type IdentifyDiseaseOutput = z.infer<typeof IdentifyDiseaseOutputSchema>;

export async function identifyDisease(input: IdentifyDiseaseInput): Promise<IdentifyDiseaseOutput> {
  return identifyDiseaseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifyDiseasePrompt',
  input: {schema: IdentifyDiseaseInputSchema},
  output: {schema: IdentifyDiseaseOutputSchema},
  prompt: `You are a medical expert specializing in disease diagnosis based on symptoms.

You will analyze the symptoms provided by the user to identify the most likely disease or illness. Provide a confidence score between 0 and 1 to indicate the certainty of your diagnosis. Explain your reasoning for identifying the disease based on the symptoms provided. Output the disease, confidence, and reasoning.

If a symptom is "none", ignore it. Base your diagnosis on the provided symptoms.

Symptoms:
Symptom 1: {{{symptom1}}}
Symptom 2: {{{symptom2}}}
Symptom 3: {{{symptom3}}}
Symptom 4: {{{symptom4}}}
Symptom 5: {{{symptom5}}}
`,
});

const identifyDiseaseFlow = ai.defineFlow(
  {
    name: 'identifyDiseaseFlow',
    inputSchema: IdentifyDiseaseInputSchema,
    outputSchema: IdentifyDiseaseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

    