package meat_to_meat.demo.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import meat_to_meat.demo.dto.order.CreateOrderRequestDTO;
import meat_to_meat.demo.dto.order.OrderResponseDTO;
import meat_to_meat.demo.dto.order.UpdateOrderStatusRequestDTO;
import meat_to_meat.demo.global.config.UrlNames;
import meat_to_meat.demo.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(UrlNames.orderBase)
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderResponseDTO> createOrder(@AuthenticationPrincipal Long userId,
                                                        @Valid @RequestBody CreateOrderRequestDTO request) {
        return ResponseEntity.ok(orderService.createOrder(userId, request.getCartItemIds()));
    }

    @GetMapping
    public ResponseEntity<List<OrderResponseDTO>> getOrders(@AuthenticationPrincipal Long userId) {
        return ResponseEntity.ok(orderService.getOrders(userId));
    }

    @GetMapping(UrlNames.orderId)
    public ResponseEntity<OrderResponseDTO> getOrder(@AuthenticationPrincipal Long userId, @PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.getOrder(userId, orderId));
    }

    @PostMapping(UrlNames.cancelOrder)
    public ResponseEntity<OrderResponseDTO> cancelOrder(@AuthenticationPrincipal Long userId, @PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.cancelOrder(userId, orderId));
    }

    @PatchMapping(UrlNames.orderId)
    public ResponseEntity<OrderResponseDTO> updateOrderStatus(@AuthenticationPrincipal Long userId,
                                                              @PathVariable Long orderId,
                                                              @Valid @RequestBody UpdateOrderStatusRequestDTO request) {
        return ResponseEntity.ok(orderService.updateOrderStatus(userId, orderId, request.getStatus()));
    }

    @DeleteMapping(UrlNames.orderId)
    public ResponseEntity<Void> deleteOrder(@AuthenticationPrincipal Long userId, @PathVariable Long orderId) {
        orderService.deleteOrder(userId, orderId);
        return ResponseEntity.noContent().build();
    }
}
