import { config } from 'dotenv';
config();

import '@/ai/flows/disease-identification.ts';
import '@/ai/flows/remedy-suggestion.ts';
import '@/ai/flows/diet-recommendation.ts';
import '@/ai/flows/severity-assessment.ts';
