package com.yaksh.research;

public interface ResearchService {
    public String processContent(ResearchRequest researchRequest);

    // Exchange authorization code for tokens
    String exchangeCodeForTokens(String code);

    // Export note to Google Docs
    String exportNoteToGoogleDoc(ResearchRequest researchRequest);
}
