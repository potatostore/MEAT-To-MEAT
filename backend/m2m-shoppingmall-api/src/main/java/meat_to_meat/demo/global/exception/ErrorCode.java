package meat_to_meat.demo.global.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // 공통 Null 에러
    NULL_VALUE_ERROR(HttpStatus.BAD_REQUEST, "필수 입력값이 null입니다."),

    // User 관련 에러
    USER_ID_NULL(HttpStatus.BAD_REQUEST, "유저 ID는 null일 수 없습니다."),
    USER_DTO_NULL(HttpStatus.BAD_REQUEST, "회원 요청 정보가 존재하지 않습니다."),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 유저입니다."),
    DUPLICATE_LOGIN_ID(HttpStatus.CONFLICT, "이미 사용 중인 아이디입니다."),
    DUPLICATE_EMAIL(HttpStatus.CONFLICT, "이미 사용 중인 이메일입니다."),
    DUPLICATE_PHONE_NUMBER(HttpStatus.CONFLICT, "이미 사용 중인 전화번호입니다."),

    // Product 관련 에러
    PRODUCT_ID_NULL(HttpStatus.BAD_REQUEST, "상품 ID는 null일 수 없습니다."),
    PRODUCT_DTO_NULL(HttpStatus.BAD_REQUEST, "상품 요청 정보가 존재하지 않습니다."),
    CATEGORY_LIST_NULL(HttpStatus.BAD_REQUEST, "카테고리 목록은 null일 수 없습니다."),
    PRODUCT_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 상품입니다."),
    DUPLICATE_PRODUCT_NAME(HttpStatus.CONFLICT, "이미 존재하는 상품명입니다."),
    OUT_OF_STOCK(HttpStatus.BAD_REQUEST, "상품의 재고가 부족합니다."),

    // Cart 관련 에러
    CART_ID_NULL(HttpStatus.BAD_REQUEST, "장바구니 ID는 null일 수 없습니다."),
    CART_DTO_NULL(HttpStatus.BAD_REQUEST, "장바구니 요청 정보가 존재하지 않습니다."),
    CART_NOT_FOUND(HttpStatus.NOT_FOUND, "장바구니가 존재하지 않습니다."),
    CART_ALREADY_EXISTS(HttpStatus.CONFLICT, "해당 유저는 이미 장바구니를 가지고 있습니다."),
    CART_ITEM_NOT_FOUND(HttpStatus.NOT_FOUND, "장바구니에 해당 상품이 존재하지 않습니다."),

    // Order 관련 에러
    ORDER_ID_NULL(HttpStatus.BAD_REQUEST, "주문 ID는 null일 수 없습니다."),
    ORDER_DTO_NULL(HttpStatus.BAD_REQUEST, "주문 요청 정보가 존재하지 않습니다."),
    ORDER_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 주문입니다.");

    private final HttpStatus status;
    private final String message;
}