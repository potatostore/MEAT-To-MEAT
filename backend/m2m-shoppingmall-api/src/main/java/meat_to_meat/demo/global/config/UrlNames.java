package meat_to_meat.demo.global.config;


/**
 * 1. URL 클래스는 controller에 매핑될 api url을 상수화 해놓은 클래스임
 * 2. 이때 url은 사전에 명세서를 통해 작성된 바가 있으니, 이를 참고할 것 (단톡방에 있음)
 * 3. 끝으로 TableNames랑 URLNames를 분류하여 상수화 했으면 함.
 */
public class UrlNames {
    public static final String cartTableName = "/carts";
    public static final String cartItemTableName = "/cart_items";

    // TODO: 명세서 기준으로 경로 확인 필요 (컴파일을 위해 임시로 채워둔 값)
    public static final String createCartURL = "/users/{user_id}";
    public static final String getALLCartURL = "";
    public static final String getCartByUserIdURL = "/users/{user_id}";
    public static final String updateCartInfoURL = "/{cart_id}";
    public static final String deleteCartInfoURL = "/{cart_id}";
    public static final String deleteCartItemURL = "/users/{user_id}/products/{product_id}";
}
