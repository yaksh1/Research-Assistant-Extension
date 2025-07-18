package com.yaksh.research;

public interface ResearchService {
    public GeminiResponse.Part processContent(ResearchRequest researchRequest);
}
