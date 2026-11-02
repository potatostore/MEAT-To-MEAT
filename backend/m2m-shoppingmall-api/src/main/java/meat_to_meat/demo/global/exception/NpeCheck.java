package meat_to_meat.demo.global.exception;

public class NpeCheck {

    // 1. ErrorCode 기반 Null 체크 (권장 - 에러코드 파일과 연동)
    public static void checkNotNull(Object target, ErrorCode errorCode) {
        if (target == null) {
            throw new IllegalArgumentException(errorCode.getMessage());
        }
    }

    // 2. 직접 메시지 입력 방식 지원
    public static void checkNotNull(Object target, String message) {
        if (target == null) {
            throw new IllegalArgumentException(message);
        }
    }
}