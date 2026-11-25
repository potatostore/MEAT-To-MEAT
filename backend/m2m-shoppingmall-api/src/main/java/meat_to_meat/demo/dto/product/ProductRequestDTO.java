package meat_to_meat.demo.dto.product;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import meat_to_meat.demo.entity.product.ProductCategory;

// 관리자용 상품 생성/수정 (POST /products, PATCH /products/{id})
@Getter
@NoArgsConstructor
public class ProductRequestDTO {

    @NotBlank(message = "상품명은 필수입니다.")
    private String name;

    @NotNull(message = "상품 가격은 필수입니다.")
    @Min(value = 1, message = "상품 가격은 1원 이상이어야 합니다.")
    private Long price;

    @NotNull(message = "카테고리는 필수입니다.")
    private ProductCategory category;

    @NotNull(message = "재고 수량은 필수입니다.")
    @Min(value = 0, message = "재고 수량은 0개 이상이어야 합니다.")
    private Integer stock;

    @NotBlank(message = "상품 설명은 필수입니다.")
    @Size(max = 500, message = "상품 설명은 500자 이하여야 합니다.")
    private String description;
}
