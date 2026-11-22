package meat_to_meat.demo.dto.cart;

import lombok.Getter;
import meat_to_meat.demo.dto.cart.cartItem.CartItemResponseDTO;
import meat_to_meat.demo.entity.cart.Cart;

import java.util.List;
import java.util.stream.Collectors;

@Getter
public class CartResponseDTO {
    private final Long cartId;
    private final Long userId;
    private final List<CartItemResponseDTO> items;
    private final Long totalCartPrice;

    public CartResponseDTO(Cart cart) {
        this.cartId = cart.getCartId();
        this.userId = cart.getUser().getUserId();
        this.items = cart.getCartItems().stream()
                .map(CartItemResponseDTO::new)
                .collect(Collectors.toList());
        this.totalCartPrice = cart.getCartItems().stream()
                .mapToLong(item -> item.getProduct().getProductPrice() * item.getQuantity())
                .sum();
    }
}