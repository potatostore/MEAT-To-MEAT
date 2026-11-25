package meat_to_meat.demo.dto.product;

import meat_to_meat.demo.entity.product.Product;
import meat_to_meat.demo.entity.product.ProductCategory;

import java.time.LocalDateTime;

public record ProductResponseDTO(
        Long id,
        String name,
        ProductCategory category,
        String categoryName,
        String description,
        Long price,
        Integer stock,
        LocalDateTime createdAt
) {
    public static ProductResponseDTO from(Product product) {
        return new ProductResponseDTO(product.getProductId(), product.getProductName(), product.getProductCategory(),
                product.getProductCategory().getDisplayName(), product.getDescription(), product.getProductPrice(),
                product.getStockQuantity(), product.getCreateAt());
    }
}
