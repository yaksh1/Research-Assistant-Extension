package com.yaksh.research;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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

    public GeminiResponse.Part processContent(ResearchRequest researchRequest) {
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

    private GeminiResponse.Part parseResponse(String response) {
        GeminiResponse.Part finalResponse = new GeminiResponse.Part();
        try{
            GeminiResponse geminiResponse = objectMapper.readValue(response, GeminiResponse.class);
            if(geminiResponse.getCandidates() == null || geminiResponse.getCandidates().isEmpty()) {
                finalResponse.setText("No candidates found in the response.");
                return finalResponse;
            }
            GeminiResponse.Candidate firstCandidate = geminiResponse.getCandidates().get(0);
            if (firstCandidate.getContent() != null &&
                    firstCandidate.getContent().getParts() != null &&
                    !firstCandidate.getContent().getParts().isEmpty()) {
                GeminiResponse.Part part = firstCandidate.getContent().getParts().get(0);
                // extract tags
                List<String> tags = extractTagsFromSummary(part.getText());
                part.setTags(tags);
                // clean summary text
                part.setText(cleanSummary(part.getText()));
                log.info("AI response: {} \n\n, Tags assigned: {}",part.getText(), part.getTags());
                return part;
            }
            finalResponse.setText("No candidates found in the response.");
            return finalResponse;
        }catch (Exception e){
            throw new RuntimeException("Error parsing response: " + e.getMessage());
        }
    }

    private String cleanSummary(String summary) {
        int tagStart = summary.lastIndexOf('[');
        return (tagStart > 0) ? summary.substring(0, tagStart).trim() : summary.trim(); // ✅ added .trim()
    }


    private List<String> extractTagsFromSummary(String summary) {
        if (summary == null) return Collections.emptyList();

        summary = summary.trim(); // ✅ normalize
        if (!summary.contains("[") || !summary.endsWith("]")) {
            return Collections.emptyList();
        }

        int startIdx = summary.lastIndexOf('[');
        int endIdx = summary.lastIndexOf(']');

        if (startIdx == -1 || endIdx == -1 || startIdx >= endIdx) {
            return Collections.emptyList();
        }

        String tagPart = summary.substring(startIdx + 1, endIdx);
        return Arrays.stream(tagPart.split(","))
                .map(String::trim)
                .filter(tag -> !tag.isEmpty())
                .collect(Collectors.toList());
    }

    private String buildPrompt(ResearchRequest request){
        StringBuilder prompt = new StringBuilder();
        switch(request.getOperation()){
            case "summarize":
                prompt.append("Summarize the following content clearly and concisely for academic or research purposes. \n" +
                        "At the end, provide exactly 3 relevant tags that represent the key themes, topics, or concepts from the content. \n" +
                        "Use lowercase, singular nouns (where appropriate), and keep tags research-oriented and consistent in style.\n" +
                        "Format the tags exactly as: [tag1, tag2, tag3]\n");
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