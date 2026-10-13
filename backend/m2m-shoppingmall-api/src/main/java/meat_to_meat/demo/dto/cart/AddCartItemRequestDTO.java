package meat_to_meat.demo.dto.cart;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class AddCartItemRequestDTO {
    private Long productId;
    private Long optionId;
    private Long quantity;
}


