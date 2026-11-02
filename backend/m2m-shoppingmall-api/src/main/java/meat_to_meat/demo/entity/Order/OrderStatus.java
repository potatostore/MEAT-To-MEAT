package meat_to_meat.demo.entity.Order;

public enum OrderStatus {
    PAID,       // 결제 완료
    PREPARING,  // 상품 준비중
    SHIPPING,   // 배송중
    DELIVERED,  // 배송 완료
    CANCELLED   // 주문 취소
}