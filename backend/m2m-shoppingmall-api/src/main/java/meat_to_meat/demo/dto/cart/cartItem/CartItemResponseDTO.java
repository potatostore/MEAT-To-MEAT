package meat_to_meat.demo.dto.cart.cartItem;

import lombok.Getter;
import meat_to_meat.demo.entity.cart.CartItem;

@Getter
public class CartItemResponseDTO {
    private final Long cartItemId;
    private final Long productId;
    private final String productName;
    private final Long productPrice;
    private final Long quantity;

    public CartItemResponseDTO(CartItem cartItem) {
        this.cartItemId = cartItem.getCartItemId();
        this.productId = cartItem.getProduct().getProductId();
        this.productName = cartItem.getProduct().getProductName();
        this.productPrice = cartItem.getProduct().getProductPrice();
        this.quantity = cartItem.getQuantity();
    }
}