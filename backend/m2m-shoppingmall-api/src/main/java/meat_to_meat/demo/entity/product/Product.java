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
import java.time.LocalDateTime;


@org.hibernate.annotations.Check(constraints = "product_price >= 1 AND product_quantity >= 1")

@Entity
@Table(name = "product")
@Getter
@NoArgsConstructor
public class Product{

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


    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Builder
    public Product(String productName, Long productPrice, Long productQuantity, String description, List<String> productCategory) {
        this.productName = productName;
        this.productPrice = productPrice;
        this.productQuantity = productQuantity;
        this.description = description;
        this.productCategory = productCategory;
        this.createdAt = LocalDateTime.now(); // (참고: BaseEntity를 상속받으셨다면 이 부분은 빼셔도 됩니다)
        this.updatedAt = LocalDateTime.now();
    }

    public void updateProductInfo(String productName, Long productPrice, Long productQuantity, String description, List<String> productCategory) {
        this.productName = productName;
        this.productPrice = productPrice;
        this.productQuantity = productQuantity;
        this.description = description;
        this.productCategory = productCategory;
        this.updatedAt = LocalDateTime.now();
    }

    public void removeStock(int quantity){
        long restStock = this.productQuantity - quantity;
        this.productQuantity = restStock;
    }


}