const MockAIProvider = require('./MockAIProvider');
const GeminiAIProvider = require('./GeminiAIProvider');

class AIService {
  constructor() {
    const providerType = process.env.AI_PROVIDER || 'mock';
    if (providerType === 'gemini' && process.env.GEMINI_API_KEY) {
      this.provider = new GeminiAIProvider(process.env.GEMINI_API_KEY);
    } else {
      this.provider = new MockAIProvider();
    }
    console.log(`[AIService] Initialized with provider: ${this.provider.name}`);
  }

  async getAssistantResponse(data) {
    try {
      return await this.provider.processAssistantQuery(data);
    } catch (err) {
      console.warn(`[AIService Fallback] ${err.message}`);
      const fallback = new MockAIProvider();
      return await fallback.processAssistantQuery(data);
    }
  }

  async runDigitalTriage(data) {
    try {
      return await this.provider.processDigitalTriage(data);
    } catch (err) {
      console.warn(`[AIService Fallback] ${err.message}`);
      const fallback = new MockAIProvider();
      return await fallback.processDigitalTriage(data);
    }
  }

  async generateRecordSummary(data) {
    try {
      return await this.provider.processRecordSummary(data);
    } catch (err) {
      console.warn(`[AIService Fallback] ${err.message}`);
      const fallback = new MockAIProvider();
      return await fallback.processRecordSummary(data);
    }
  }

  async generateReferralSummary(data) {
    try {
      return await this.provider.processReferralSummary(data);
    } catch (err) {
      console.warn(`[AIService Fallback] ${err.message}`);
      const fallback = new MockAIProvider();
      return await fallback.processReferralSummary(data);
    }
  }

  async analyzePatientRisk(data) {
    try {
      return await this.provider.processRiskAssessment(data);
    } catch (err) {
      console.warn(`[AIService Fallback] ${err.message}`);
      const fallback = new MockAIProvider();
      return await fallback.processRiskAssessment(data);
    }
  }
}

module.exports = new AIService();
