package meat_to_meat.demo.entity.Order;

public enum OrderStatus {
    ORDER_RECEIVED,       // 주문 접수
    PREPARING_DELIVERY,   // 배송 준비 중
    IN_TRANSIT,           // 배송 중
    DELIVERED,            // 배송 완료
    ORDER_CANCELED        // 주문 취소
}
