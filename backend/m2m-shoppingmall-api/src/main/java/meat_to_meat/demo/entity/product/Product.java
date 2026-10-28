package meat_to_meat.demo.entity.product;

import jakarta.persistence.*;
import jakarta.persistence.Column;
import java.util.ArrayList;
import java.util.List;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import meat_to_meat.demo.entity.BaseEntity; // BaseEntity 임포트

@org.hibernate.annotations.Check(constraints = "product_price >= 1 AND product_quantity >= 1")
@Entity
@Table(name = "product")
@Getter
@NoArgsConstructor
public class Product extends BaseEntity { // 상속 추가

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

    @Column(nullable = false)
    @NotBlank
    private String description;

    @Column(unique = true,  nullable = false)
    @NotBlank
    private String productName;

    @Column(nullable = false)
    @Min(value = 1)
    private Long productPrice;

    @Column(nullable = false)
    private Long productQuantity;

    // 💡 BaseEntity가 관리하므로 createdAt, updatedAt 필드 삭제

    @Builder
    public Product(String productName, Long productPrice, Long productQuantity, String description, List<String> productCategory) {
        this.productName = productName;
        this.productPrice = productPrice;
        this.productQuantity = productQuantity;
        this.description = description;
        this.productCategory = productCategory;
        // 💡 수동으로 시간을 넣던 로직 삭제
    }

    public void updateProductInfo(String productName, Long productPrice, Long productQuantity, String description, List<String> productCategory) {
        this.productName = productName;
        this.productPrice = productPrice;
        this.productQuantity = productQuantity;
        this.description = description;
        this.productCategory = productCategory;
        // 💡 수동으로 시간을 갱신하던 로직 삭제
    }

    public void removeStock(int quantity){
        // 💡 누락되었던 빼기(-) 연산자 수정
        long restStock = this.productQuantity - quantity;
        this.productQuantity = restStock;
    }
}