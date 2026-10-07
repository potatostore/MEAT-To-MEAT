package meat_to_meat.demo.global.exception;

/**
 * 앞으로 exception을 생성하면 공통 규정이 필요할 것이고, 이 클래스를 통해 공통 규정을 정의할 수 있음.
 * ErrorCode만 받는 메서드와 ErrorCode + message를 받는 메서드 총 두개를 모든 예외에 상속하여
 * 각 예외별로 공통된 규격을 만듦.
 */

public class GlobalMeatToMeatException extends RuntimeException {
    public GlobalMeatToMeatException(String message) {
        super(message);
    }
}
