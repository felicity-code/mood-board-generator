import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

interface AutomatedInputProps {
  onGenerate: (prompt: string) => Promise<void>;
  isLoading: boolean;
}

const AutomatedInput: React.FC<AutomatedInputProps> = ({ onGenerate, isLoading }) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      await onGenerate(prompt.trim());
    }
  };

  const examplePrompts = [
    'modern minimalist bedroom',
    'cozy bohemian living room',
    'scandinavian home office',
    'industrial loft space',
    'tropical vacation vibes'
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8 text-blue-500 mr-3" />
          <h2 className="text-3xl font-bold text-gray-900">
            AI Mood Board Generator
          </h2>
        </div>
        <p className="text-gray-600 text-lg">
          Describe your ideal space and watch AI create a beautiful mood board instantly
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
            What kind of space do you want to create?
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., modern minimalist bedroom with natural light and plants..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={!prompt.trim() || isLoading}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Generating your mood board...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Mood Board
            </>
          )}
        </button>
      </form>

      <div className="mt-8">
        <p className="text-sm text-gray-500 mb-3">Try these examples:</p>
        <div className="flex flex-wrap gap-2">
          {examplePrompts.map((example, index) => (
            <button
              key={index}
              onClick={() => setPrompt(example)}
              disabled={isLoading}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">✨ What happens next?</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• AI analyzes your prompt and identifies style preferences</li>
          <li>• Curates high-quality images that match your vision</li>
          <li>• Creates a balanced, professional layout automatically</li>
          <li>• Adds inspirational text elements</li>
          <li>• Generates your mood board in under 2 minutes</li>
        </ul>
      </div>
    </div>
  );
};

export default AutomatedInput;




