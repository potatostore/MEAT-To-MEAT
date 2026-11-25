package meat_to_meat.demo.dto.order;

import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

// POST /orders : 장바구니에서 주문할 항목(cart_item_id) 목록
@Getter
@NoArgsConstructor
public class CreateOrderRequestDTO {

    @NotEmpty(message = "주문할 상품을 선택해 주세요.")
    private List<Long> cartItemIds;
}
