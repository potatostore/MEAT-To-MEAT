package meat_to_meat.demo.global.exception;

public class NotFoundException extends GlobalMeatToMeatException {

    public NotFoundException(ErrorCode errorCode) {
        super(errorCode);
    }

    public NotFoundException(ErrorCode errorCode, String message) {
        super(errorCode, message);
    }
}