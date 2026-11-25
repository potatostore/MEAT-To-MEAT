package meat_to_meat.demo.dto.cart;

import meat_to_meat.demo.entity.cart.Cart;

import java.util.List;

public record CartResponseDTO(List<CartItemResponseDTO> items, long totalPrice) {
    public static CartResponseDTO from(Cart cart) {
        List<CartItemResponseDTO> items = cart.getCartItems().stream().map(CartItemResponseDTO::from).toList();
        long totalPrice = items.stream().mapToLong(i -> i.unitPrice() * i.quantity()).sum();
        return new CartResponseDTO(items, totalPrice);
    }
}
