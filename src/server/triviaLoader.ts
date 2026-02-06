import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import type { Question } from './types';

interface OpenTDBResponse {
  response_code: number;
  results: Question[];
}

export class TriviaLoader {
  private questions: Question[] = [];

  async loadQuestions(triviaDir: string): Promise<Question[]> {
    try {
      const files = await readdir(triviaDir);
      const jsonFiles = files.filter(file => file.endsWith('.json'));

      for (const file of jsonFiles) {
        const filePath = join(triviaDir, file);
        const content = await readFile(filePath, 'utf-8');
        const data: OpenTDBResponse = JSON.parse(content);

        if (data.results && Array.isArray(data.results)) {
          this.questions.push(...data.results);
        }
      }

      // Shuffle questions
      this.shuffleQuestions();

      console.log(`Loaded ${this.questions.length} questions from ${jsonFiles.length} file(s)`);
      return this.questions;
    } catch (error) {
      console.error('Error loading trivia questions:', error);
      return [];
    }
  }

  private shuffleQuestions(): void {
    for (let i = this.questions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.questions[i], this.questions[j]] = [this.questions[j], this.questions[i]];
    }
  }

  getQuestions(): Question[] {
    return this.questions;
  }
}
