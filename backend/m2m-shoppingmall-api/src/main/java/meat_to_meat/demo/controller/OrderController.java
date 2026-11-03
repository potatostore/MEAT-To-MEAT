package meat_to_meat.demo.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import meat_to_meat.demo.dto.order.OrderResponseDTO;
import meat_to_meat.demo.dto.order.OrderUpdateDTO;
import meat_to_meat.demo.global.config.UrlNames;
import meat_to_meat.demo.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping(UrlNames.orderBase)
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping(value = UrlNames.createOrder)
    public ResponseEntity<OrderResponseDTO> createOrder(@PathVariable Long userId) {
        return ResponseEntity.ok(orderService.createOrder(userId));
    }

    @GetMapping(value = UrlNames.getOrder)
    public ResponseEntity<OrderResponseDTO> getOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.getOrder(orderId));
    }

    @GetMapping(value = UrlNames.getOrdersByUserId)
    public ResponseEntity<List<OrderResponseDTO>> getOrdersByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(orderService.getOrdersByUserId(userId));
    }

    @PatchMapping(value = UrlNames.updateOrder)
    public ResponseEntity<OrderResponseDTO> updateOrder(
            @PathVariable Long orderId,
            @Valid @RequestBody OrderUpdateDTO orderUpdateDTO) {
        return ResponseEntity.ok(orderService.updateOrder(orderId, orderUpdateDTO));
    }

    @DeleteMapping(value = UrlNames.deleteOrder)
    public ResponseEntity<Void> deleteOrder(@PathVariable Long orderId) {
        orderService.deleteOrder(orderId);
        return ResponseEntity.noContent().build();
    }
}