package meat_to_meat.demo.dto.cart;

import jakarta.persistence.GeneratedValue;
import lombok.Getter;
import meat_to_meat.demo.entity.cart.Cart;

@Getter
public class CartResponseDTO {

    private Long cartId;

    public CartResponseDTO(Cart cart) {
        this.cartId = cart.getCartId();
    }
}
