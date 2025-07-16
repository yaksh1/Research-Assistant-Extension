package com.yaksh.research;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/research")
@CrossOrigin(origins = "*") // allow all apis to be accessed from frontend
@RequiredArgsConstructor
public class ResearchController {
    private final ResearchService researchService;

    @PostMapping("/process")
    public ResponseEntity<String> process(@RequestBody ResearchRequest researchRequest){
        return ResponseEntity.ok("");
    }

}
