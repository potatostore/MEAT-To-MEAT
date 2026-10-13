package meat_to_meat.demo.dto.product;

import lombok.Getter;
import lombok.NoArgsConstructor;
import java.util.List;

@Getter
@NoArgsConstructor
public class ProductUpdateDTO {

    private String productName;
    private Long productPrice;
    private Long productQuantity;
    private String description;
    private List<String> productCategory;
}
