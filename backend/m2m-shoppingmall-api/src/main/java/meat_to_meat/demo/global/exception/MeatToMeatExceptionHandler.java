package meat_to_meat.demo.global.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Collections;

@RestControllerAdvice
public class MeatToMeatExceptionHandler {

    // 1. 커스텀 전역 예외 (NotFoundException, DuplicateException 등) 처리
    @ExceptionHandler(GlobalMeatToMeatException.class)
    public ResponseEntity handleGlobalMeatToMeatException(GlobalMeatToMeatException e) {
        String message = e.getMessage() != null ? e.getMessage() : e.getErrorCode().getMessage();
        return ResponseEntity
                .status(e.getErrorCode().getStatus())
                .body(Collections.singletonMap("message", message));
    }

    // 2. 잘못된 인자 예외 처리
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity handleIllegalArgumentException(IllegalArgumentException e) {
        String message = e.getMessage() != null ? e.getMessage() : "잘못된 요청입니다.";
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Collections.singletonMap("message", message));
    }

    // 3. DTO @Valid 유효성 검증 실패 예외 처리
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity handleValidationException(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldError() != null
                ? e.getBindingResult().getFieldError().getDefaultMessage()
                : "입력값 검증에 실패했습니다.";
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Collections.singletonMap("message", message));
    }

    // 4. JSON 파싱 및 Enum/날짜 타입 불일치 예외 처리 추가
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity handleHttpMessageNotReadableException(HttpMessageNotReadableException e) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Collections.singletonMap("message", "요청 JSON 형식 또는 Enum/날짜 값이 올바르지 않습니다: " + e.getMostSpecificCause().getMessage()));
    }
}