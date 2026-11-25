package meat_to_meat.demo.dto.cart;

import meat_to_meat.demo.entity.cart.CartItem;
import meat_to_meat.demo.entity.product.Product;
import meat_to_meat.demo.entity.product.ProductCategory;

public record CartItemResponseDTO(
        Long id,
        Long productId,
        String productName,
        ProductCategory category,
        Long unitPrice,
        Integer quantity,
        Integer stock
) {
    public static CartItemResponseDTO from(CartItem item) {
        Product product = item.getProduct();
        return new CartItemResponseDTO(item.getCartItemId(), product.getProductId(), product.getProductName(),
                product.getProductCategory(), product.getProductPrice(), item.getQuantity(), product.getStockQuantity());
    }
}
