package meat_to_meat.demo.service;

import lombok.RequiredArgsConstructor;
import meat_to_meat.demo.dto.order.OrderResponseDTO;
import meat_to_meat.demo.entity.cart.Cart;
import meat_to_meat.demo.entity.cart.CartItem;
import meat_to_meat.demo.entity.order.Order;
import meat_to_meat.demo.entity.order.OrderItem;
import meat_to_meat.demo.entity.order.OrderStatus;
import meat_to_meat.demo.entity.product.Product;
import meat_to_meat.demo.global.exception.ErrorCode;
import meat_to_meat.demo.global.exception.GlobalMeatToMeatException;
import meat_to_meat.demo.global.exception.NotFoundException;
import meat_to_meat.demo.repository.CartRepository;
import meat_to_meat.demo.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;

    // ORD-01 주문 생성: 선택한 장바구니 항목을 주문으로 옮기고 재고를 차감한다
    @Transactional
    public OrderResponseDTO createOrder(Long userId, List<Long> cartItemIds) {
        Cart cart = cartRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.CART_NOT_FOUND, "userId=" + userId));

        List<CartItem> selected = cart.getCartItems().stream()
                .filter(item -> cartItemIds.contains(item.getCartItemId()))
                .toList();
        if (selected.isEmpty()) {
            throw new GlobalMeatToMeatException(ErrorCode.ORDER_ITEMS_EMPTY);
        }

        // 재고 차감과 총액 계산 (재고 부족 시 OUT_OF_STOCK)
        long totalOrderPrice = 0L;
        for (CartItem cartItem : selected) {
            Product product = cartItem.getProduct();
            product.removeStock(cartItem.getQuantity());
            totalOrderPrice += product.getProductPrice() * cartItem.getQuantity();
        }

        Order order = Order.builder()
                .user(cart.getUser())
                .orderStatus(OrderStatus.ORDER_RECEIVED)
                .totalOrderPrice(totalOrderPrice)
                .build();
        for (CartItem cartItem : selected) {
            order.getOrderItems().add(OrderItem.builder()
                    .order(order)
                    .product(cartItem.getProduct())
                    .quantity(cartItem.getQuantity())
                    .orderPrice(cartItem.getProduct().getProductPrice()) // 주문 당시 단가 스냅샷
                    .build());
        }
        Order saved = orderRepository.save(order); // order_item 은 cascade 로 함께 저장

        // 주문한 항목만 장바구니에서 제거 (orphanRemoval)
        cart.getCartItems().removeAll(selected);
        orderRepository.flush();
        return OrderResponseDTO.from(saved);
    }

    // ORD-03 사용자별 주문 정보 (최신순)
    @Transactional(readOnly = true)
    public List<OrderResponseDTO> getOrders(Long userId) {
        return orderRepository.findAllByUser_UserIdOrderByCreateAtDesc(userId).stream()
                .map(OrderResponseDTO::from)
                .toList();
    }

    // ORD-02 / ORD-04 사용자별 특정 주문
    @Transactional(readOnly = true)
    public OrderResponseDTO getOrder(Long userId, Long orderId) {
        return OrderResponseDTO.from(findOrder(userId, orderId));
    }

    // 주문 취소: 접수 상태에서만 가능, 차감했던 재고를 되돌린다
    @Transactional
    public OrderResponseDTO cancelOrder(Long userId, Long orderId) {
        Order order = findOrder(userId, orderId);
        if (order.getOrderStatus() != OrderStatus.ORDER_RECEIVED) {
            throw new GlobalMeatToMeatException(ErrorCode.ORDER_CANNOT_CANCEL);
        }
        order.getOrderItems().forEach(item -> item.getProduct().addStock(item.getQuantity()));
        order.updateOrderStatus(OrderStatus.ORDER_CANCELED);
        return OrderResponseDTO.from(order);
    }

    // ORD-05 주문 수정 (상태 변경)
    @Transactional
    public OrderResponseDTO updateOrderStatus(Long userId, Long orderId, OrderStatus status) {
        Order order = findOrder(userId, orderId);
        order.updateOrderStatus(status);
        return OrderResponseDTO.from(order);
    }

    // ORD-06 주문 삭제
    @Transactional
    public void deleteOrder(Long userId, Long orderId) {
        orderRepository.delete(findOrder(userId, orderId));
    }

    // 다른 회원의 주문은 존재 여부도 드러내지 않도록 404 로 처리
    private Order findOrder(Long userId, Long orderId) {
        return orderRepository.findByOrderIdAndUser_UserId(orderId, userId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.ORDER_NOT_FOUND, "id=" + orderId));
    }
}
