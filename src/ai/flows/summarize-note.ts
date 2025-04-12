'use server';
/**
 * @fileOverview Summarizes a long note into a concise summary using Genkit and Gemini AI.
 *
 * - summarizeNote - A function that handles the note summarization process.
 * - SummarizeNoteInput - The input type for the summarizeNote function.
 * - SummarizeNoteOutput - The return type for the summarizeNote function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SummarizeNoteInputSchema = z.object({
  note: z.string().describe('The long note or paragraph to be summarized.'),
});
export type SummarizeNoteInput = z.infer<typeof SummarizeNoteInputSchema>;

const SummarizeNoteOutputSchema = z.object({
  summary: z.string().describe('The concise summary of the input note.'),
});
export type SummarizeNoteOutput = z.infer<typeof SummarizeNoteOutputSchema>;

export async function summarizeNote(input: SummarizeNoteInput): Promise<SummarizeNoteOutput> {
  return summarizeNoteFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeNotePrompt',
  input: {
    schema: z.object({
      note: z.string().describe('The long note or paragraph to be summarized.'),
    }),
  },
  output: {
    schema: z.object({
      summary: z.string().describe('The concise summary of the input note.'),
    }),
  },
  prompt: `Summarize the following note into a concise summary that captures the key points.\n\nNote: {{{note}}}`,
});

const summarizeNoteFlow = ai.defineFlow<
  typeof SummarizeNoteInputSchema,
  typeof SummarizeNoteOutputSchema
>({
  name: 'summarizeNoteFlow',
  inputSchema: SummarizeNoteInputSchema,
  outputSchema: SummarizeNoteOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});
