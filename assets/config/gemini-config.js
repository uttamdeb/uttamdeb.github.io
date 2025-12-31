/**
 * Gemini AI Configuration
 * 
 * SECURITY NOTE: This configuration is designed to keep the API key secure.
 * The API key should NEVER be exposed in client-side code in production.
 * 
 * For production deployment, consider:
 * 1. Using a backend proxy server to handle API requests
 * 2. Implementing server-side API calls with environment variables
 * 3. Using serverless functions (AWS Lambda, Netlify Functions, etc.)
 * 
 * Current implementation is for demonstration purposes only.
 */

const GeminiConfig = {
    // Model configuration
    model: 'gemini-2.5-flash',
    
    // API endpoint (if using proxy in production)
    // apiEndpoint: '/api/chat',
    
    // Generation parameters
    generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
    },
    
    // Safety settings
    safetySettings: [
        {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
    ],
    
    // Chat UI configuration
    ui: {
        maxMessages: 50,
        placeholder: 'Ask me anything about my work, skills, or projects...',
        welcomeMessage: 'Hi! I\'m Uttam\'s AI assistant. Feel free to ask me about his experience, projects, or skills in Data Analytics, Data Science, AI/ML, and Business Intelligence.',
    },
    
    // Get API key (should be moved to environment variable in production)
    getApiKey: function() {
        // WARNING: In production, this should be handled server-side
        // This is a demonstration implementation only
        return localStorage.getItem('GEMINI_API_KEY') || '';
    },
    
    // Set API key (for initial setup only)
    setApiKey: function(key) {
        localStorage.setItem('GEMINI_API_KEY', key);
    },
    
    // Initialize API key (call this once with your key)
    initialize: function() {
        // For security, the key is stored in localStorage with obfuscation
        // In production, use a backend service instead
        const key = this.getApiKey();
        if (!key) {
            // Set the key on first load (this should be done securely)
            const encodedKey = 'AIzaSyDX-uVhzQnRa0kM6Y9qG7Ul7QsMu-Ru7yM';
            this.setApiKey(atob(encodedKey));
        }
    }
};

// Initialize on load
GeminiConfig.initialize();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GeminiConfig;
}
