package meat_to_meat.demo.global.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // 공통 Null 에러
    NULL_VALUE_ERROR("필수 입력값이 null입니다."),

    // User 관련 에러
    USER_ID_NULL("유저 ID는 null일 수 없습니다."),
    USER_DTO_NULL("회원 요청 정보가 존재하지 않습니다."),
    USER_NOT_FOUND("존재하지 않는 유저입니다."),

    // Product 관련 에러
    PRODUCT_ID_NULL("상품 ID는 null일 수 없습니다."),
    PRODUCT_DTO_NULL("상품 요청 정보가 존재하지 않습니다."),
    PRODUCT_NOT_FOUND("존재하지 않는 상품입니다."),

    // Cart 관련 에러
    CART_ID_NULL("장바구니 ID는 null일 수 없습니다."),
    CART_DTO_NULL("장바구니 요청 정보가 존재하지 않습니다."),
    CART_NOT_FOUND("장바구니가 존재하지 않습니다."),
    CART_ALREADY_EXISTS("해당 유저는 이미 장바구니를 가지고 있습니다."),
    CART_ITEM_NOT_FOUND("장바구니에 해당 상품이 존재하지 않습니다."),

    // Order 관련 에러
    ORDER_ID_NULL("주문 ID는 null일 수 없습니다."),
    ORDER_DTO_NULL("주문 요청 정보가 존재하지 않습니다."),
    ORDER_NOT_FOUND("존재하지 않는 주문입니다.");

    private final String message;
}