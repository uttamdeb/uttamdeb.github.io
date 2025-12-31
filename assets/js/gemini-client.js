/**
 * Gemini AI Client
 * Handles communication with Google's Gemini API with streaming support
 */

class GeminiClient {
    constructor() {
        this.systemPrompt = '';
        this.conversationHistory = [];
        this.isInitialized = false;
        this.systemPromptLoaded = false;
        this.genAI = null;
        this.model = null;
        this.chat = null;
        
        // Load system prompt
        this.loadSystemPrompt();
    }
    
    /**
     * Load system prompt from file
     */
    async loadSystemPrompt() {
        try {
            console.log('Loading system prompt...');
            const response = await fetch('assets/config/system-prompt.txt');
            this.systemPrompt = await response.text();
            this.systemPromptLoaded = true;
            console.log('System prompt loaded:', this.systemPrompt);
        } catch (error) {
            console.error('Failed to load system prompt:', error);
            this.systemPrompt = '';
            this.systemPromptLoaded = true;
        }
    }
    
    /**
     * Initialize the Gemini AI client
     */
    async initialize() {
        if (this.isInitialized) return true;
        
        try {
            const apiKey = GeminiConfig.getApiKey();
            if (!apiKey) {
                console.error('No API key found');
                throw new Error('API key not configured');
            }
            
            console.log('Initializing Gemini with model:', GeminiConfig.model);
            
            // Import Google Generative AI library (old SDK for backward compatibility)
            const { GoogleGenerativeAI } = await import('https://esm.run/@google/generative-ai');
            
            this.genAI = new GoogleGenerativeAI(apiKey);
            this.model = this.genAI.getGenerativeModel({
                model: GeminiConfig.model,
                generationConfig: GeminiConfig.generationConfig,
                safetySettings: GeminiConfig.safetySettings,
                systemInstruction: this.systemPrompt || undefined,
            });
            
            // Start a new chat session
            this.chat = this.model.startChat({
                history: [],
            });
            
            this.isInitialized = true;
            console.log('✓ Gemini initialized successfully');
            return true;
        } catch (error) {
            console.error('✗ Failed to initialize Gemini:', error);
            return false;
        }
    }
    
    /**
     * Send a message and stream the response
     * @param {string} message - User message
     * @param {function} onChunk - Callback for each chunk of response
     * @param {function} onComplete - Callback when streaming is complete
     * @param {function} onError - Callback for errors
     */
    async sendMessageStream(message, onChunk, onComplete, onError) {
        try {
            console.log('📤 Sending message:', message);
            
            // Wait for system prompt to load
            if (!this.systemPromptLoaded) {
                console.log('⏳ Waiting for system prompt...');
                await this.loadSystemPrompt();
            }
            
            // Initialize if needed
            if (!this.isInitialized) {
                console.log('⏳ Initializing Gemini...');
                const initialized = await this.initialize();
                if (!initialized) {
                    throw new Error('Failed to initialize Gemini client');
                }
            }
            
            console.log('💬 Sending to Gemini...');
            
            // Send message with streaming
            const result = await this.chat.sendMessageStream(message);
            
            console.log('📥 Stream started, processing chunks in real-time...');
            
            let fullResponse = '';
            let chunkCount = 0;
            
            // Process stream - this should yield chunks as they arrive
            for await (const chunk of result.stream) {
                chunkCount++;
                const chunkText = chunk.text();
                console.log(`📦 Chunk #${chunkCount} (${chunkText.length} chars):`, chunkText.substring(0, 30) + '...');
                fullResponse += chunkText;
                
                // Call onChunk IMMEDIATELY for each chunk
                if (onChunk && typeof onChunk === 'function') {
                    console.log('⚡ Calling onChunk callback NOW');
                    onChunk(chunkText);
                }
            }
            
            console.log(`✅ Stream finished. Total chunks: ${chunkCount}, Total length: ${fullResponse.length}`);
            
            console.log('✓ Stream complete. Total length:', fullResponse.length);
            
            // Add to conversation history
            this.conversationHistory.push({
                role: 'user',
                content: message
            });
            this.conversationHistory.push({
                role: 'model',
                content: fullResponse
            });
            
            // Limit history size
            if (this.conversationHistory.length > GeminiConfig.ui.maxMessages * 2) {
                this.conversationHistory = this.conversationHistory.slice(-GeminiConfig.ui.maxMessages * 2);
            }
            
            if (onComplete && typeof onComplete === 'function') {
                console.log('✓ Calling onComplete');
                onComplete(fullResponse);
            }
            
        } catch (error) {
            console.error('✗ Error:', error.message);
            console.error('Stack:', error.stack);
            if (onError && typeof onError === 'function') {
                onError(error);
            }
        }
    }
    
    /**
     * Clear conversation history and restart chat
     */
    async clearHistory() {
        this.conversationHistory = [];
        if (this.isInitialized && this.model) {
            this.chat = this.model.startChat({
                history: [],
            });
            console.log('✓ Chat history cleared');
        }
    }
    
    /**
     * Get conversation history
     */
    getHistory() {
        return [...this.conversationHistory];
    }
}

// Create and export a singleton instance
const geminiClient = new GeminiClient();

// Export for ES modules
export default geminiClient;

// Also expose globally for non-module scripts
if (typeof window !== 'undefined') {
    window.geminiClient = geminiClient;
}
