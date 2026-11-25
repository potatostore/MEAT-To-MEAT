package meat_to_meat.demo.entity.product;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import meat_to_meat.demo.entity.BaseEntity;
import meat_to_meat.demo.global.exception.ErrorCode;
import meat_to_meat.demo.global.exception.GlobalMeatToMeatException;

// 명세서 5.1 (6) 상품: product
@Entity
@Getter
@Table(name = "product")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Product extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_id")
    private Long productId;

    @Column(name = "product_name", nullable = false, unique = true)
    private String productName;

    @Column(name = "product_price", nullable = false)
    private Long productPrice;

    @Enumerated(EnumType.STRING)
    @Column(name = "product_category", nullable = false, length = 20)
    private ProductCategory productCategory;

    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity;

    @Column(name = "description", nullable = false, length = 500)
    private String description;

    @Builder
    public Product(String productName, Long productPrice, ProductCategory productCategory, Integer stockQuantity, String description) {
        this.productName = productName;
        this.productPrice = productPrice;
        this.productCategory = productCategory;
        this.stockQuantity = stockQuantity;
        this.description = description;
    }

    public void updateInfo(String productName, Long productPrice, ProductCategory productCategory, Integer stockQuantity, String description) {
        this.productName = productName;
        this.productPrice = productPrice;
        this.productCategory = productCategory;
        this.stockQuantity = stockQuantity;
        this.description = description;
    }

    public void removeStock(int quantity) {
        if (this.stockQuantity < quantity) {
            throw new GlobalMeatToMeatException(ErrorCode.OUT_OF_STOCK, "현재 재고: " + this.stockQuantity);
        }
        this.stockQuantity -= quantity;
    }

    public void addStock(int quantity) {
        this.stockQuantity += quantity;
    }
}
