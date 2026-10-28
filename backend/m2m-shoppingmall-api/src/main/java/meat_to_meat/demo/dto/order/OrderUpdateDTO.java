package meat_to_meat.demo.dto.order;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import meat_to_meat.demo.entity.Order.OrderStatus;

@Getter
@NoArgsConstructor
public class OrderUpdateDTO {

    @NotNull(message = "변경할 주문 상태는 필수입니다.")
    private OrderStatus orderStatus;

}
