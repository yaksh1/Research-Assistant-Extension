package com.yaksh.research;


import lombok.Data;
import java.util.List;

@Data
public class ResearchRequest {
    private String content;
    private String operation;
    private String summaryStyle;
    private List<String> tags;
}
