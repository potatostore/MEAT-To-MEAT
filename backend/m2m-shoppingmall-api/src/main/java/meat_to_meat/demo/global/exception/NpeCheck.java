package meat_to_meat.demo.global.exception;

public class NpeCheck {

    // 1. ErrorCode 기반 Null 체크 (GlobalMeatToMeatException으로 통일)
    public static void checkNotNull(Object target, ErrorCode errorCode) {
        if (target == null) {
            throw new GlobalMeatToMeatException(errorCode);
        }
    }

    // 2. ErrorCode + 상세 메시지 입력 방식 지원
    public static void checkNotNull(Object target, ErrorCode errorCode, String message) {
        if (target == null) {
            throw new GlobalMeatToMeatException(errorCode, message);
        }
    }
}