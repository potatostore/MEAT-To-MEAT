package meat_to_meat.demo.dto.order;

import lombok.Getter;
import meat_to_meat.demo.entity.Order.Order;
import meat_to_meat.demo.entity.Order.OrderStatus;

@Getter
public class OrderResponseDTO {

    private Long orderId;
    private OrderStatus orderStatus;
    private Long totalOrderPrice;

    public OrderResponseDTO(Order order){
        this.orderId = order.getOrderId();
        this.orderStatus = order.getStatus();
        this.totalOrderPrice = order.getTotalOrderPrice();
    }
}
