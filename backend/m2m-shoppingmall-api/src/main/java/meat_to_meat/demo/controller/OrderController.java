package meat_to_meat.demo.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import meat_to_meat.demo.dto.order.OrderResponseDTO;
import meat_to_meat.demo.dto.order.OrderUpdateDTO;
import meat_to_meat.demo.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping(value = "/create/{user_id}")
    public ResponseEntity<OrderResponseDTO> createOrder(@PathVariable("user_id") Long userId){
        return ResponseEntity.ok(
                orderService.createOrder(userId)
        );
    }

    @GetMapping(value = "/{order_id}")
    public ResponseEntity<OrderResponseDTO> getOrder(@PathVariable("order_id") Long orderId){
        return ResponseEntity.ok(
                orderService.getOrder(orderId)
        );
    }

    @PatchMapping(value = "/{order_id}")
    public ResponseEntity<OrderResponseDTO> updateOrder(
            @PathVariable("order_id") Long orderId,
            @Valid @RequestBody OrderUpdateDTO orderUpdateDTO){
        return ResponseEntity.ok(
                orderService.updateOrder(orderId, orderUpdateDTO)
        );
    }

    @DeleteMapping(value = "/{order_id}")
    public ResponseEntity<OrderResponseDTO> deleteOrder(@PathVariable("order_id") Long orderId){
        orderService.deleteOrder(orderId);
        return ResponseEntity.ok().build();
    }
}