package meat_to_meat.demo.entity.Order;

import jakarta.persistence.*;
import jakarta.transaction.Transactional;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import meat_to_meat.demo.dto.order.OrderResponseDTO;
import meat_to_meat.demo.dto.order.OrderUpdateDTO;
import meat_to_meat.demo.entity.BaseEntity; // BaseEntity 임포트
import meat_to_meat.demo.entity.user.User;

@Entity
@Getter
@Table(name = "orders")
@NoArgsConstructor
public class Order extends BaseEntity { // 상속 추가
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long orderId;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    private Long totalOrderPrice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Builder
    public Order(User user, OrderStatus status, Long totalOrderPrice) {
        this.user = user;
        this.status = status;
        this.totalOrderPrice = totalOrderPrice;
    }

    public void updateStatus(OrderStatus status) {
        this.status = status;
    }


}