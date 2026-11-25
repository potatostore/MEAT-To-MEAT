package meat_to_meat.demo.global.config;

// 프론트(frontend/src/lib/api/config.ts 의 ENDPOINTS)와 1:1 로 맞춘 API 경로
public final class UrlNames {

    private UrlNames() {
    }

    // 인증
    public static final String authBase = "/auth";
    public static final String signup = "/signup";
    public static final String login = "/login";
    public static final String logout = "/logout";

    // 회원 (로그인한 본인)
    public static final String memberBase = "/members/me";
    public static final String password = "/password";

    // 카테고리
    public static final String categoryBase = "/categories";

    // 상품
    public static final String productBase = "/products";
    public static final String productId = "/{productId}";

    // 장바구니 (로그인한 본인)
    public static final String cartBase = "/cart";
    public static final String cartItems = "/items";
    public static final String cartItemId = "/items/{cartItemId}";

    // 주문 (로그인한 본인)
    public static final String orderBase = "/orders";
    public static final String orderId = "/{orderId}";
    public static final String cancelOrder = "/{orderId}/cancel";
}
