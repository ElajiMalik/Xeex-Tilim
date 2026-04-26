class AnthropicClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async qualify(text) {
    return {
      texte: text,
      categorie: 'HYGIENE_URBAINE',
      urgence: 'MOYENNE',
      articles: [],
      mode: 'mock',
    };
  }
}

let singleton;

export function getAnthropicClient() {
  if (!singleton) {
    singleton = new AnthropicClient(process.env.ANTHROPIC_API_KEY ?? 'mock-key');
  }
  return singleton;
}
