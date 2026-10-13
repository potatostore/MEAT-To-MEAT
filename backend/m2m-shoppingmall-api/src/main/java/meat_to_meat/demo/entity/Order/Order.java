package meat_to_meat.demo.entity.Order;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import meat_to_meat.demo.entity.user.User;

@Entity
@Getter
@Table(name = "orders")
@NoArgsConstructor

public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long orderId;

    @Enumerated(EnumType.STRING)
    private OrderStatus status; // DTO에서 getStatus()로 호출하셨으므로 변수명을 일치시켰습니다.

    private Long totalOrderPrice;

    // 회원은 여러 개의 주문을 가질 수 있으므로 @ManyToOne을 사용합니다.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Builder
    public Order(User user, OrderStatus status, Long totalOrderPrice) {
        this.user = user;
        this.status = status;
        this.totalOrderPrice = totalOrderPrice;
    }
}
