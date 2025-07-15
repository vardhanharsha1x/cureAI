'use server';

/**
 * @fileOverview Diet recommendation AI agent.
 *
 * - dietRecommendation - A function that handles the diet recommendation process.
 * - DietRecommendationInput - The input type for the dietRecommendation function.
 * - DietRecommendationOutput - The return type for the dietRecommendation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DietRecommendationInputSchema = z.object({
  disease: z.string().describe('The identified disease or illness.'),
});
export type DietRecommendationInput = z.infer<typeof DietRecommendationInputSchema>;

const DietRecommendationOutputSchema = z.object({
  dietRecommendation: z.string().describe('The recommended diet to follow based on the identified disease, formatted in Markdown.'),
});
export type DietRecommendationOutput = z.infer<typeof DietRecommendationOutputSchema>;

export async function dietRecommendation(input: DietRecommendationInput): Promise<DietRecommendationOutput> {
  return dietRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dietRecommendationPrompt',
  input: {schema: DietRecommendationInputSchema},
  output: {schema: DietRecommendationOutputSchema},
  prompt: `You are a nutritionist specializing in diet recommendations for various diseases and illnesses.

  Based on the identified disease, provide a diet recommendation.
  
  Format the response in Markdown as exactly 4 bullet points. Each bullet point should be a concise sentence, approximately 2 lines long.
  Use "*" for bullet points and "**" for bolding text. Do not use headings.

  Disease: {{{disease}}}
  `,
});

const dietRecommendationFlow = ai.defineFlow(
  {
    name: 'dietRecommendationFlow',
    inputSchema: DietRecommendationInputSchema,
    outputSchema: DietRecommendationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
