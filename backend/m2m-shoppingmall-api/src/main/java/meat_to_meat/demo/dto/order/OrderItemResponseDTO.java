package meat_to_meat.demo.dto.order;

import meat_to_meat.demo.entity.order.OrderItem;

// unitPrice 는 order_item.order_price (주문 당시 단가 스냅샷)
public record OrderItemResponseDTO(Long id, Long productId, String productName, Long unitPrice, Integer quantity) {
    public static OrderItemResponseDTO from(OrderItem item) {
        return new OrderItemResponseDTO(item.getOrderItemId(), item.getProduct().getProductId(),
                item.getProduct().getProductName(), item.getOrderPrice(), item.getQuantity());
    }
}
