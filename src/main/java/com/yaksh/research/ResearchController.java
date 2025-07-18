package com.yaksh.research;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Value;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/api/research")
@CrossOrigin(origins = "*") // allow all apis to be accessed from frontend
@RequiredArgsConstructor
public class ResearchController {
    private final ResearchService researchService;

    @Value("${google.client.id}")
    private String googleClientId;
    @Value("${google.redirect.uri}")
    private String googleRedirectUri;

    // Step 1: Redirect to Google OAuth2 consent screen
    @GetMapping("/auth/google")
    public void googleAuth(HttpServletResponse response) throws IOException {
        String oauthUrl = "https://accounts.google.com/o/oauth2/v2/auth" +
                "?client_id=" + googleClientId +
                "&redirect_uri=" + googleRedirectUri +
                "&response_type=code" +
                "&scope=https://www.googleapis.com/auth/documents https://www.googleapis.com/auth/drive.file" +
                "&access_type=offline";
        response.sendRedirect(oauthUrl);
    }

    // Step 2: Handle OAuth2 callback
    @GetMapping("/oauth2/callback")
    public ResponseEntity<String> googleCallback(@RequestParam("code") String code) {
        String result = researchService.exchangeCodeForTokens(code);
        return ResponseEntity.ok(result);
    }

    // Step 3: Export note to Google Docs
    @PostMapping("/export/google-doc")
    public ResponseEntity<String> exportToGoogleDoc(@RequestBody ResearchRequest researchRequest) {
        String result = researchService.exportNoteToGoogleDoc(researchRequest);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/process")
    public ResponseEntity<String> process(@RequestBody ResearchRequest researchRequest){
        return ResponseEntity.ok(researchService.processContent(researchRequest));
    }

}
