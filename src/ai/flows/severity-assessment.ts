// This is an AI-powered health assistant, DO NOT use as a replacement for medical advice.
'use server';

/**
 * @fileOverview Severity assessment AI agent.
 *
 * - assessSeverity - A function that handles the severity assessment process.
 * - AssessSeverityInput - The input type for the assessSeverity function.
 * - AssessSeverityOutput - The return type for the assessSeverity function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AssessSeverityInputSchema = z.object({
  disease: z.string().describe('The identified disease or illness.'),
  symptoms: z.array(z.string()).describe('List of symptoms provided by the user.'),
});
export type AssessSeverityInput = z.infer<typeof AssessSeverityInputSchema>;

const AssessSeverityOutputSchema = z.object({
  severity: z.enum(['Mild', 'Moderate', 'Severe']).describe('The assessed severity of the condition.'),
});
export type AssessSeverityOutput = z.infer<typeof AssessSeverityOutputSchema>;

export async function assessSeverity(input: AssessSeverityInput): Promise<AssessSeverityOutput> {
  return assessSeverityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'assessSeverityPrompt',
  input: {schema: AssessSeverityInputSchema},
  output: {schema: AssessSeverityOutputSchema},
  prompt: `You are a medical expert assessing the severity of a condition.
Based on the identified disease and the user's symptoms, assess the severity as "Mild", "Moderate", or "Severe".

Disease: {{{disease}}}
Symptoms:
{{#each symptoms}}
- {{{this}}}
{{/each}}
`,
});

const assessSeverityFlow = ai.defineFlow(
  {
    name: 'assessSeverityFlow',
    inputSchema: AssessSeverityInputSchema,
    outputSchema: AssessSeverityOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
