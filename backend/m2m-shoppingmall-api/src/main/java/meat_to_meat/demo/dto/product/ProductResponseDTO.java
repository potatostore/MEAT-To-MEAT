package meat_to_meat.demo.dto.product;

import lombok.Getter;
import meat_to_meat.demo.entity.product.Product;
import java.util.List;

@Getter
public class ProductResponseDTO {
    private Long productId;
    private String productName;
    private Long productPrice;
    private Long productQuantity;
    private String description;
    private List<String> productCategory;

    public ProductResponseDTO(Product product) {
        this.productId = product.getProductId();
        this.productName = product.getProductName();
        this.productPrice = product.getProductPrice();
        this.productQuantity = product.getProductQuantity();
        this.description = product.getDescription();
        this.productCategory = product.getProductCategory();
    }
}
