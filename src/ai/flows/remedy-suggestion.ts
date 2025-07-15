'use server';

/**
 * @fileOverview Suggests initial remedy/cure steps based on the identified disease.
 *
 * - remedySuggestion - A function that suggests remedies based on the identified disease.
 * - RemedySuggestionInput - The input type for the remedySuggestion function.
 * - RemedySuggestionOutput - The return type for the remedySuggestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RemedySuggestionInputSchema = z.object({
  disease: z.string().describe('The identified disease or illness.'),
  symptoms: z.array(z.string()).describe('List of symptoms provided by the user'),
});
export type RemedySuggestionInput = z.infer<typeof RemedySuggestionInputSchema>;

const RemedySuggestionOutputSchema = z.object({
  remedies: z.array(z.string()).describe('List of suggested remedies or cure steps.'),
});
export type RemedySuggestionOutput = z.infer<typeof RemedySuggestionOutputSchema>;

export async function remedySuggestion(input: RemedySuggestionInput): Promise<RemedySuggestionOutput> {
  return remedySuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'remedySuggestionPrompt',
  input: {schema: RemedySuggestionInputSchema},
  output: {schema: RemedySuggestionOutputSchema},
  prompt: `Based on the identified disease: {{{disease}}}, and the following symptoms provided by the user: {{{symptoms}}}, suggest some initial remedy or cure steps.

Provide the remedies in bullet points. The entire response should not exceed three paragraphs in total length. Be concise.
`,
});

const remedySuggestionFlow = ai.defineFlow(
  {
    name: 'remedySuggestionFlow',
    inputSchema: RemedySuggestionInputSchema,
    outputSchema: RemedySuggestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
