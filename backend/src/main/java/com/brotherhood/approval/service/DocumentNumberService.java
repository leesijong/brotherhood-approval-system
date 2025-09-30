package com.brotherhood.approval.service;

import com.brotherhood.approval.entity.Document;
import com.brotherhood.approval.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

/**
 * 문서번호 생성 서비스
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentNumberService {
    
    private final DocumentRepository documentRepository;
    
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");
    
    /**
     * 문서번호 생성
     */
    public String generateDocumentNumber(String documentType) {
        String prefix = getDocumentTypePrefix(documentType);
        String dateStr = LocalDate.now().format(DATE_FORMATTER);
        
        // 해당 날짜의 문서 수 조회
        long count = documentRepository.count();
        String sequence = String.format("%04d", count + 1);
        
        String documentNumber = String.format("%s-%s-%s", prefix, dateStr, sequence);
        
        // 중복 확인 및 재생성
        int retryCount = 0;
        while (documentRepository.existsByDocumentNumber(documentNumber) && retryCount < 10) {
            count++;
            sequence = String.format("%04d", count + 1);
            documentNumber = String.format("%s-%s-%s", prefix, dateStr, sequence);
            retryCount++;
        }
        
        if (retryCount >= 10) {
            throw new RuntimeException("문서번호 생성에 실패했습니다");
        }
        
        log.info("문서번호 생성: {}", documentNumber);
        return documentNumber;
    }
    
    /**
     * 문서 유형별 접두사 반환
     */
    private String getDocumentTypePrefix(String documentType) {
        return switch (documentType) {
            case "GENERAL" -> "GEN";
            case "BUDGET" -> "BUD";
            case "HR" -> "HR";
            case "SECURITY" -> "SEC";
            case "ADMINISTRATIVE" -> "ADM";
            case "FINANCIAL" -> "FIN";
            default -> "DOC";
        };
    }
}
