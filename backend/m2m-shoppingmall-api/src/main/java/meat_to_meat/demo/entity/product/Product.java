package meat_to_meat.demo.entity.product;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import meat_to_meat.demo.entity.BaseEntity;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor
public class Product extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long productId;

    @ElementCollection
    @CollectionTable(
            name = "product_category",
            joinColumns = @JoinColumn(name = "product_id")
    )
    @Column(name = "category_name", nullable = false)
    private List<String> productCategory = new ArrayList<>();

    @Column(nullable = false, length = 500)
    @NotBlank
    private String description;

    @Column(unique = true, nullable = false)
    @NotBlank
    private String productName;

    @Column(nullable = false)
    @Min(value = 1)
    private Long productPrice;

    @Column(name = "stock_quantity", nullable = false)
    private Long productQuantity;

    @Builder
    public Product(String productName, Long productPrice, Long productQuantity, String description, List<String> productCategory) {
        this.productName = productName;
        this.productPrice = productPrice;
        this.productQuantity = productQuantity;
        this.description = description;
        this.productCategory = productCategory;
    }

    public void updateProductInfo(String productName, Long productPrice, Long productQuantity, String description, List<String> productCategory) {
        this.productName = productName;
        this.productPrice = productPrice;
        this.productQuantity = productQuantity;
        this.description = description;
        this.productCategory = productCategory;
    }

    public void removeStock(long quantity) {
        long restStock = this.productQuantity - quantity;
        if (restStock < 0) {
            throw new meat_to_meat.demo.global.exception.GlobalMeatToMeatException(
                    meat_to_meat.demo.global.exception.ErrorCode.OUT_OF_STOCK,
                    "현재 재고: " + this.productQuantity
            );
        }
        this.productQuantity = restStock;
    }
}