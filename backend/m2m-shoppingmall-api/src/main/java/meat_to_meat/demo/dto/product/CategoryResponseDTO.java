package meat_to_meat.demo.dto.product;

import meat_to_meat.demo.entity.product.ProductCategory;

public record CategoryResponseDTO(ProductCategory code, String name, String description) {
    public static CategoryResponseDTO from(ProductCategory category) {
        return new CategoryResponseDTO(category, category.getDisplayName(), category.getDescription());
    }
}
