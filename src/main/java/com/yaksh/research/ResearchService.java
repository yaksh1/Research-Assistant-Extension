package com.yaksh.research;

public interface ResearchService {
    public String processContent(ResearchRequest researchRequest);
    // Classify note content and return tags
    public java.util.List<String> classifyTopics(String content);
}
