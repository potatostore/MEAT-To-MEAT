package meat_to_meat.demo.dto.order;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import meat_to_meat.demo.entity.order.OrderStatus;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class OrderUpdateDTO {

    @NotNull(message = "변경할 주문 상태는 필수입니다.")
    private OrderStatus orderStatus;
}