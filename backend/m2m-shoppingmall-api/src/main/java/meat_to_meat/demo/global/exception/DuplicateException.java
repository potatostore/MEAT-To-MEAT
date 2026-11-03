package meat_to_meat.demo.global.exception;

public class DuplicateException extends GlobalMeatToMeatException {

    public DuplicateException(ErrorCode errorCode) {
        super(errorCode);
    }

    public DuplicateException(ErrorCode errorCode, String message) {
        super(errorCode, message);
    }
}