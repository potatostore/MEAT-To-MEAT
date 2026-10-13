package meat_to_meat.demo.dto.order;

import lombok.Getter;
import lombok.NoArgsConstructor;
import meat_to_meat.demo.entity.Order.OrderStatus;

@Getter
@NoArgsConstructor
public class OrderUpdateDTO {
    private OrderStatus orderStatus;

}
