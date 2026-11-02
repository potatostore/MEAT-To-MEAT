package meat_to_meat.demo.dto.cart;

import lombok.Getter;
import meat_to_meat.demo.entity.cart.Cart;

@Getter
public class CartResponseDTO {

    private Long cartId;
    private Long userId;

    public CartResponseDTO(Cart cart) {
        this.cartId = cart.getCartId();
        this.userId = cart.getUser() != null ? cart.getUser().getUserId() : null;
    }
}