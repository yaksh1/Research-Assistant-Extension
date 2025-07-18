package com.yaksh.research;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/research")
@CrossOrigin(origins = "*") // allow all apis to be accessed from frontend
@Slf4j
@RequiredArgsConstructor
public class ResearchController {
    private final ResearchService researchService;

    @PostMapping("/process")
    public ResponseEntity<GeminiResponse.Part> process(@RequestBody ResearchRequest researchRequest){
        return ResponseEntity.ok(researchService.processContent(researchRequest));
    }

}
