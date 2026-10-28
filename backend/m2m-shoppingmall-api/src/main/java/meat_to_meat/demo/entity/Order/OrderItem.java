package meat_to_meat.demo.entity.Order;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import meat_to_meat.demo.entity.BaseEntity;
import meat_to_meat.demo.entity.product.Product;

@Entity
@Getter
@Table(name = "order_item")
@NoArgsConstructor
public class OrderItem extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long orderItemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    private Long orderPrice; // 주문 당시 단가 스냅샷

    @Builder
    public OrderItem(Order order, Product product, Integer quantity, Long orderPrice) {
        this.order = order;
        this.product = product;
        this.quantity = quantity;
        this.orderPrice = orderPrice;
    }
}