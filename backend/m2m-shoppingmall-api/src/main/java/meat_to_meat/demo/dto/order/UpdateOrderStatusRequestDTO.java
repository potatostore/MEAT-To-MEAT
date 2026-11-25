package meat_to_meat.demo.dto.order;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import meat_to_meat.demo.entity.order.OrderStatus;

// PATCH /orders/{id} (ORD-05 주문 수정)
@Getter
@NoArgsConstructor
public class UpdateOrderStatusRequestDTO {

    @NotNull(message = "변경할 주문 상태는 필수입니다.")
    private OrderStatus status;
}
