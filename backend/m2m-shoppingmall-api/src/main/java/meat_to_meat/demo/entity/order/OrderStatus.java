package meat_to_meat.demo.entity.order;

// 명세서 5.1(4) orders.order_status CHECK 값과 동일
public enum OrderStatus {
    ORDER_RECEIVED,      // 주문 접수
    PREPARING_DELIVERY,  // 배송 준비중
    IN_TRANSIT,          // 배송중
    DELIVERED,           // 배송 완료
    ORDER_CANCELED       // 주문 취소
}
