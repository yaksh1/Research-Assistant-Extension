package com.yaksh.research;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service
@Slf4j
public class ResearchServiceImpl implements ResearchService{

    @Value("${gemini.api.url}")
    private String geminiApiURL;
    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public ResearchServiceImpl(WebClient.Builder webclientBuilder) {
        this.webClient = webclientBuilder.build();
        this.objectMapper = new ObjectMapper();
    }

    public String processContent(ResearchRequest researchRequest) {
        // build prompt
        String prompt = buildPrompt(researchRequest);
        // create a request body for AI model (check curl in POSTMAN)
        Map<String,Object> requestBody = Map.of("contents",new Object[]{
                Map.of("parts",new Object[]{
                        Map.of("text",prompt)
                })
        });
        // call the API
        String response = webClient.post().uri(geminiApiURL+geminiApiKey)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        // parse and return response
        return parseResponse(response);
    }

    private String parseResponse(String response) {
        try{
            GeminiResponse geminiResponse = objectMapper.readValue(response, GeminiResponse.class);
            if(geminiResponse.getCandidates() == null || geminiResponse.getCandidates().isEmpty()) {
                return "No response from AI model.";
            }
            GeminiResponse.Candidate firstCandidate = geminiResponse.getCandidates().get(0);
            if (firstCandidate.getContent() != null &&
                    firstCandidate.getContent().getParts() != null &&
                    !firstCandidate.getContent().getParts().isEmpty()) {
                String text = firstCandidate.getContent().getParts().get(0).getText();
                log.info("AI Response: {}", text);
                return text;
            }
            return "No response from AI model.";
        }catch (Exception e){
            throw new RuntimeException("Error parsing response: " + e.getMessage());
        }
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

    @Override
    public java.util.List<String> classifyTopics(String content) {
        // TODO: Call Gemini/OpenAI for topic classification
        // For now, return a static list for demo
        return java.util.List.of("Science", "Technology");
    }
}