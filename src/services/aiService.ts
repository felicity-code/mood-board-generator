// AI Service for automated mood board generation
export interface StyleAnalysis {
  primaryStyle: string;
  secondaryStyles: string[];
  colorPalette: string[];
  mood: string;
  keywords: string[];
  spaceType: string;
}

export interface ImageQuery {
  query: string;
  color?: string;
  orientation?: 'landscape' | 'portrait' | 'squarish';
}

export interface GeneratedContent {
  images: ImageQuery[];
  textElements: string[];
  layout: 'grid' | 'masonry' | 'focal' | 'balanced';
  colorScheme: string[];
}

class AIService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Analyze user prompt and extract style information
   */
  async analyzePrompt(prompt: string): Promise<StyleAnalysis> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are a design expert. Analyze the following prompt and extract:
              1. Primary design style (modern, minimalist, bohemian, etc.)
              2. Secondary styles (up to 3)
              3. Color palette (5-7 colors in hex format)
              4. Mood/atmosphere (calm, energetic, cozy, etc.)
              5. Relevant keywords for image search
              6. Space type (bedroom, living room, office, etc.)
              
              Return as JSON with keys: primaryStyle, secondaryStyles, colorPalette, mood, keywords, spaceType`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const analysisText = data.choices[0]?.message?.content;
      
      if (!analysisText) {
        throw new Error('No analysis returned from OpenAI');
      }

      return JSON.parse(analysisText);
    } catch (error) {
      console.error('Error analyzing prompt:', error);
      // Fallback analysis for demo purposes
      return this.getFallbackAnalysis(prompt);
    }
  }

  /**
   * Generate image search queries based on style analysis
   */
  generateImageQueries(analysis: StyleAnalysis): ImageQuery[] {
    const baseQueries = [
      `${analysis.primaryStyle} ${analysis.spaceType}`,
      `${analysis.mood} ${analysis.primaryStyle} interior`,
      `${analysis.spaceType} design ${analysis.primaryStyle}`,
      `${analysis.primaryStyle} ${analysis.spaceType} decor`,
    ];

    // Add color-specific queries
    const colorQueries = analysis.colorPalette.slice(0, 3).map(color => 
      `${analysis.primaryStyle} ${analysis.spaceType} ${color}`
    );

    return [...baseQueries, ...colorQueries].map(query => ({
      query: query.trim(),
      orientation: 'landscape' as const
    }));
  }

  /**
   * Generate text elements for the mood board
   */
  async generateTextElements(analysis: StyleAnalysis): Promise<string[]> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `Generate 3-5 short, inspirational text elements for a ${analysis.primaryStyle} ${analysis.spaceType} mood board. 
              Make them relevant to the ${analysis.mood} atmosphere. Keep each under 10 words. Return as JSON array.`
            },
            {
              role: 'user',
              content: `Style: ${analysis.primaryStyle}, Space: ${analysis.spaceType}, Mood: ${analysis.mood}`
            }
          ],
          temperature: 0.8,
          max_tokens: 200
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const textContent = data.choices[0]?.message?.content;
      
      if (!textContent) {
        throw new Error('No text generated from OpenAI');
      }

      return JSON.parse(textContent);
    } catch (error) {
      console.error('Error generating text:', error);
      return this.getFallbackText(analysis);
    }
  }

  /**
   * Generate complete mood board content
   */
  async generateMoodBoard(prompt: string): Promise<GeneratedContent> {
    const analysis = await this.analyzePrompt(prompt);
    const imageQueries = this.generateImageQueries(analysis);
    const textElements = await this.generateTextElements(analysis);

    return {
      images: imageQueries,
      textElements,
      layout: this.determineLayout(analysis),
      colorScheme: analysis.colorPalette
    };
  }

  /**
   * Determine optimal layout based on analysis
   */
  private determineLayout(analysis: StyleAnalysis): 'grid' | 'masonry' | 'focal' | 'balanced' {
    if (analysis.primaryStyle === 'minimalist') return 'grid';
    if (analysis.primaryStyle === 'bohemian') return 'masonry';
    if (analysis.mood === 'energetic') return 'focal';
    return 'balanced';
  }

  /**
   * Fallback analysis for demo purposes
   */
  private getFallbackAnalysis(prompt: string): StyleAnalysis {
    const lowerPrompt = prompt.toLowerCase();
    
    return {
      primaryStyle: lowerPrompt.includes('modern') ? 'modern' : 
                   lowerPrompt.includes('minimal') ? 'minimalist' :
                   lowerPrompt.includes('bohemian') ? 'bohemian' : 'modern',
      secondaryStyles: ['contemporary'],
      colorPalette: ['#f8f9fa', '#e9ecef', '#dee2e6', '#6c757d', '#495057'],
      mood: lowerPrompt.includes('calm') ? 'calm' : 'cozy',
      keywords: prompt.split(' ').slice(0, 5),
      spaceType: lowerPrompt.includes('bedroom') ? 'bedroom' :
                 lowerPrompt.includes('living') ? 'living room' :
                 lowerPrompt.includes('office') ? 'office' : 'room'
    };
  }

  /**
   * Fallback text for demo purposes
   */
  private getFallbackText(analysis: StyleAnalysis): string[] {
    return [
      `${analysis.primaryStyle} living`,
      'Find your space',
      'Create & inspire',
      'Design your dream'
    ];
  }
}

export default AIService;




