package meat_to_meat.demo.global.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

// 에러별 코드들을 작성하고, 에러들별로 메세지를 작성.

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    CART_NOT_FOUND(HttpStatus.NOT_FOUND, "CT001", "Cannot found cart"); // 이처럼 예외별 코드 작성

    private final HttpStatus httpStatus;
    private final String errorCode;
    private final String message;
}
