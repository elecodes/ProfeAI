export interface Lesson {
  id: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  title: string; // Assuming lessons have titles
  description?: string;
  content?: any; // Flexible content structure
  order?: number;
  [key: string]: any;
}
