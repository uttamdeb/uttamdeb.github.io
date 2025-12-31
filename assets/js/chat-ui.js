/**
 * AI Chat UI Controller
 * Manages the chat interface and interactions
 */

class ChatUI {
    constructor() {
        this.isOpen = false;
        this.isProcessing = false;
        this.elements = {};
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }
    
    /**
     * Initialize the chat UI
     */
    initialize() {
        this.createChatHTML();
        this.cacheElements();
        this.attachEventListeners();
        this.displayWelcomeMessage();
    }
    
    /**
     * Create and inject chat HTML into the page
     */
    createChatHTML() {
        const chatHTML = `
            <!-- AI Chat Button -->
            <button id="ai-chat-button" aria-label="Open AI Chat">
                <img src="tenten-icon.png" alt="Chat with Uttam" />
            </button>
            
            <!-- Tooltip -->
            <div id="ai-chat-tooltip">Chat with me now</div>
            
            <!-- AI Chat Container -->
            <div id="ai-chat-container">
                <!-- Header -->
                <div id="ai-chat-header">
                    <h3>
                        <span class="status-indicator"></span>
                        Uttam Deb
                    </h3>
                    <button id="ai-chat-close" aria-label="Close Chat">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <!-- Messages -->
                <div id="ai-chat-messages"></div>
                
                <!-- Input Area -->
                <div id="ai-chat-input-container">
                    <textarea 
                        id="ai-chat-input" 
                        placeholder="${GeminiConfig.ui.placeholder}"
                        rows="1"
                        aria-label="Type your message"
                    ></textarea>
                    <button id="ai-chat-send" aria-label="Send Message">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        `;
        
        // Inject into body
        const container = document.createElement('div');
        container.innerHTML = chatHTML;
        document.body.appendChild(container);
    }
    
    /**
     * Cache DOM elements
     */
    cacheElements() {
        this.elements = {
            button: document.getElementById('ai-chat-button'),
            tooltip: document.getElementById('ai-chat-tooltip'),
            container: document.getElementById('ai-chat-container'),
            header: document.getElementById('ai-chat-header'),
            closeBtn: document.getElementById('ai-chat-close'),
            messages: document.getElementById('ai-chat-messages'),
            input: document.getElementById('ai-chat-input'),
            sendBtn: document.getElementById('ai-chat-send'),
        };
    }
    
    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Open chat
        this.elements.button.addEventListener('click', () => this.openChat());
        
        // Close chat
        this.elements.closeBtn.addEventListener('click', () => this.closeChat());
        
        // Send message
        this.elements.sendBtn.addEventListener('click', () => this.sendMessage());
        
        // Handle Enter key in textarea
        this.elements.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Auto-resize textarea
        this.elements.input.addEventListener('input', () => {
            this.autoResizeTextarea();
        });
        
        // Close on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeChat();
            }
        });
    }
    
    /**
     * Open the chat interface
     */
    openChat() {
        this.isOpen = true;
        this.elements.container.classList.add('active');
        this.elements.button.style.display = 'none';
        this.elements.tooltip.style.display = 'none';
        
        // Focus input after animation
        setTimeout(() => {
            this.elements.input.focus();
        }, 300);
    }
    
    /**
     * Close the chat interface
     */
    closeChat() {
        this.isOpen = false;
        this.elements.container.classList.remove('active');
        
        // Show button after animation
        setTimeout(() => {
            this.elements.button.style.display = 'flex';
        }, 300);
    }
    
    /**
     * Display welcome message
     */
    displayWelcomeMessage() {
        const welcomeHTML = `
            <div class="welcome-message">
                ${GeminiConfig.ui.welcomeMessage}
            </div>
        `;
        this.elements.messages.innerHTML = welcomeHTML;
    }
    
    /**
     * Add a message to the chat
     */
    addMessage(content, role = 'user') {
        const messageHTML = `
            <div class="chat-message ${role}">
                <div class="chat-message-avatar">
                    ${role === 'user' ? 'U' : 'AI'}
                </div>
                <div class="chat-message-content">
                    ${this.formatMessage(content)}
                </div>
            </div>
        `;
        
        this.elements.messages.insertAdjacentHTML('beforeend', messageHTML);
        
        // Apply syntax highlighting to code blocks
        const lastMessage = this.elements.messages.lastElementChild;
        if (typeof hljs !== 'undefined') {
            lastMessage.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });
        }
        
        // Render KaTeX math expressions
        if (typeof renderMathInElement !== 'undefined') {
            renderMathInElement(lastMessage, {
                delimiters: [
                    {left: '$$', right: '$$', display: true},
                    {left: '$', right: '$', display: false},
                    {left: '\\\\(', right: '\\\\)', display: false},
                    {left: '\\\\[', right: '\\\\]', display: true}
                ],
                throwOnError: false
            });
        }
        
        this.scrollToBottom();
    }
    
    /**
     * Add streaming message placeholder
     */
    addStreamingMessage() {
        const streamingHTML = `
            <div class="chat-message assistant streaming-message">
                <div class="chat-message-avatar">AI</div>
                <div class="chat-message-content">
                    <span class="streaming-text"></span><span class="cursor">▋</span>
                </div>
            </div>
        `;
        
        this.elements.messages.insertAdjacentHTML('beforeend', streamingHTML);
        this.scrollToBottom();
        
        const textElement = this.elements.messages.querySelector('.streaming-message .streaming-text');
        console.log('📝 Created streaming text element:', textElement);
        return textElement;
    }
    
    /**
     * Show typing indicator
     */
    showTypingIndicator() {
        const typingHTML = `
            <div class="chat-message assistant typing-message">
                <div class="chat-message-avatar">AI</div>
                <div class="chat-message-content">
                    <div class="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        `;
        
        this.elements.messages.insertAdjacentHTML('beforeend', typingHTML);
        this.scrollToBottom();
    }
    
    /**
     * Remove typing indicator
     */
    removeTypingIndicator() {
        const typingMessage = this.elements.messages.querySelector('.typing-message');
        if (typingMessage) {
            typingMessage.remove();
        }
    }
    
    /**
     * Finalize streaming message
     */
    finalizeStreamingMessage() {
        const streamingMessage = this.elements.messages.querySelector('.streaming-message');
        if (streamingMessage) {
            streamingMessage.classList.remove('streaming-message');
            const cursor = streamingMessage.querySelector('.cursor');
            if (cursor) {
                cursor.remove();
            }
            
            // Re-render content with proper formatting
            const contentElement = streamingMessage.querySelector('.chat-message-content');
            if (contentElement) {
                const rawText = contentElement.textContent;
                contentElement.innerHTML = this.formatMessage(rawText);
                
                // Apply syntax highlighting
                if (typeof hljs !== 'undefined') {
                    contentElement.querySelectorAll('pre code').forEach((block) => {
                        hljs.highlightElement(block);
                    });
                }
                
                // Render KaTeX
                if (typeof renderMathInElement !== 'undefined') {
                    renderMathInElement(contentElement, {
                        delimiters: [
                            {left: '$$', right: '$$', display: true},
                            {left: '$', right: '$', display: false},
                            {left: '\\(', right: '\\)', display: false},
                            {left: '\\[', right: '\\]', display: true}
                        ],
                        throwOnError: false
                    });
                }
            }
        }
    }
    
    /**
     * Show error message
     */
    showError(message) {
        const errorHTML = `
            <div class="error-message">
                <strong>Error:</strong> ${message}
            </div>
        `;
        
        this.elements.messages.insertAdjacentHTML('beforeend', errorHTML);
        this.scrollToBottom();
    }
    
    /**
     * Send message to Gemini
     */
    async sendMessage() {
        const message = this.elements.input.value.trim();
        
        if (!message || this.isProcessing) {
            return;
        }
        
        // Add user message
        this.addMessage(message, 'user');
        
        // Clear input
        this.elements.input.value = '';
        this.autoResizeTextarea();
        
        // Set processing state
        this.isProcessing = true;
        this.elements.sendBtn.disabled = true;
        
        // Show typing indicator
        this.showTypingIndicator();
        
        try {
            // Brief delay then start streaming (reduce from 500ms to 200ms)
            setTimeout(() => {
                this.removeTypingIndicator();
                const streamingElement = this.addStreamingMessage();
                
                console.log('🎬 Starting stream, element ready:', streamingElement);
                
                // Send to Gemini with streaming
                geminiClient.sendMessageStream(
                    message,
                    // On chunk - this should be called for EACH chunk as it arrives
                    (chunk) => {
                        console.log('🎨 UI received chunk (length=' + chunk.length + '), current text length:', streamingElement.textContent.length);
                        streamingElement.textContent += chunk;
                        this.scrollToBottom();
                    },
                    // On complete
                    (fullResponse) => {
                        this.finalizeStreamingMessage();
                        this.isProcessing = false;
                        this.elements.sendBtn.disabled = false;
                        this.elements.input.focus();
                    },
                    // On error
                    (error) => {
                        console.error('Chat error:', error);
                        this.removeTypingIndicator();
                        const streamingMsg = this.elements.messages.querySelector('.streaming-message');
                        if (streamingMsg) {
                            streamingMsg.remove();
                        }
                        const errorMsg = error.message || 'Failed to get response. Please try again.';
                        this.showError(errorMsg);
                        console.error('Error details:', error);
                        this.isProcessing = false;
                        this.elements.sendBtn.disabled = false;
                    }
                );
            }, 200);
            
        } catch (error) {
            this.removeTypingIndicator();
            this.showError(error.message || 'Failed to send message. Please try again.');
            this.isProcessing = false;
            this.elements.sendBtn.disabled = false;
        }
    }
    
    /**
     * Format message content with full markdown, code blocks, and KaTeX support
     */
    formatMessage(content) {
        if (!content) return '';
        
        try {
            // Configure marked for better rendering
            if (typeof marked !== 'undefined') {
                marked.setOptions({
                    breaks: true,
                    gfm: true,
                    headerIds: false,
                    mangle: false,
                });
                
                // Parse markdown
                let formatted = marked.parse(content);
                
                return formatted;
            } else {
                // Fallback to basic formatting if marked is not loaded
                return content
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/\n/g, '<br>');
            }
        } catch (error) {
            console.error('Error formatting message:', error);
            return content.replace(/\n/g, '<br>');
        }
    }
    
    /**
     * Auto-resize textarea based on content
     */
    autoResizeTextarea() {
        const textarea = this.elements.input;
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
    
    /**
     * Scroll messages to bottom
     */
    scrollToBottom() {
        const messages = this.elements.messages;
        messages.scrollTop = messages.scrollHeight;
    }
    
    /**
     * Clear chat history
     */
    clearHistory() {
        geminiClient.clearHistory();
        this.elements.messages.innerHTML = '';
        this.displayWelcomeMessage();
    }
}

// Initialize chat UI when the script loads
const chatUI = new ChatUI();

// Export for external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = chatUI;
}
