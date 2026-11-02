package meat_to_meat.demo.dto.product;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ProductUpdateDTO {

    @NotBlank(message = "상품명은 필수입니다.")
    private String productName;

    @NotNull(message = "상품 가격은 필수입니다.")
    @Min(value = 1, message = "상품 가격은 1원 이상이어야 합니다.")
    private Long productPrice;

    @NotNull(message = "재고 수량은 필수입니다.")
    @Min(value = 0, message = "재고 수량은 0개 이상이어야 합니다.")
    private Long productQuantity;

    @NotBlank(message = "상품 설명은 필수입니다.")
    private String description;

    @NotEmpty(message = "상품 카테고리는 최소 1개 이상 선택해야 합니다.")
    private List<String> productCategory;
}