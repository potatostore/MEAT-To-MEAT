package meat_to_meat.demo.dto.order;

import meat_to_meat.demo.entity.order.Order;
import meat_to_meat.demo.entity.order.OrderStatus;

import java.time.LocalDateTime;
import java.util.List;

public record OrderResponseDTO(
        Long id,
        OrderStatus status,
        List<OrderItemResponseDTO> items,
        Long totalPrice,
        LocalDateTime createdAt
) {
    public static OrderResponseDTO from(Order order) {
        return new OrderResponseDTO(order.getOrderId(), order.getOrderStatus(),
                order.getOrderItems().stream().map(OrderItemResponseDTO::from).toList(),
                order.getTotalOrderPrice(), order.getCreateAt());
    }
}
