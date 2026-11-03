package meat_to_meat.demo.global.config;

public class UrlNames {

    // === User URLs ===
    public static final String userBase = "/users";
    public static final String createUser = "/signup";
    public static final String getAllUsers = "";
    public static final String getUser = "/{userId}";
    public static final String updateUser = "/{userId}";
    public static final String deleteUser = "/{userId}";

    // === Product URLs ===
    public static final String productBase = "/products";
    public static final String createProduct = "/create";
    public static final String getAllProducts = "";
    public static final String getProduct = "/{productId}";
    public static final String getProductsByCategory = "/category";
    public static final String updateProduct = "/{productId}";
    public static final String deleteProduct = "/{productId}";

    // === Cart URLs ===
    public static final String cartBase = "/cart";
    public static final String createCart = "/users/{userId}";
    public static final String addCartItem = "/users/{userId}/items";
    public static final String getAllCarts = "";
    public static final String getCartByUserId = "/users/{userId}";
    public static final String updateCart = "/{cartId}";
    public static final String deleteCart = "/{cartId}";
    public static final String deleteCartItem = "/users/{userId}/products/{productId}";

    // === Order URLs ===
    public static final String orderBase = "/orders";
    public static final String createOrder = "/create/{userId}";
    public static final String getOrder = "/{orderId}";
    public static final String getOrdersByUserId = "/users/{userId}";
    public static final String updateOrder = "/{orderId}";
    public static final String deleteOrder = "/{orderId}";
}