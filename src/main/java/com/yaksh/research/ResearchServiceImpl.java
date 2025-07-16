package com.yaksh.research;

import org.springframework.stereotype.Service;

@Service
public class ResearchServiceImpl implements ResearchService{
    public String processContent(ResearchRequest researchRequest) {
        return "";
    }

    private String buildPrompt(ResearchRequest request){
        StringBuilder prompt = new StringBuilder();
        switch(request.getOperation()){
            case "summarize":
                prompt.append("Provide a clear and concise summary of the following text:\n\n");
                break;
            case "suggest":
                prompt.append("Based on the following content: suggest related topics and further reading. Format the response with clear headings and bullet points:\n\n");
                break;
            default:
                throw new IllegalArgumentException("Unknown Operation: " + request.getOperation());
        }
        prompt.append(request.getContent());
        return prompt.toString();
    }
}
