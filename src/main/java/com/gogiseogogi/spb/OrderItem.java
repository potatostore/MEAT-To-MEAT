package com.gogiseogogi.spb;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Getter
@Table(name = "order_item")
@NoArgsConstructor

public class OrderItem {

    @Column(nullable = false)
    private Long orderPrice;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long orderItemId;

    @Column(columnDefinition = "integer check (quantity >= 1)")
    private Long quantity;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    private LocalDateTime created_at;
    private LocalDateTime updated_at;

}
