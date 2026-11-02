package meat_to_meat.demo.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import meat_to_meat.demo.dto.cart.CartResponseDTO;
import meat_to_meat.demo.dto.cart.CartUpdateDTO;
import meat_to_meat.demo.global.config.UrlNames;
import meat_to_meat.demo.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping(UrlNames.cartBase)
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @PostMapping(value = UrlNames.createCart)
    public ResponseEntity<CartResponseDTO> createCart(@PathVariable("userId") Long userId) {
        return ResponseEntity.ok(cartService.createCart(userId));
    }

    @GetMapping(value = UrlNames.getAllCarts)
    public ResponseEntity<List<CartResponseDTO>> getCarts() {
        return ResponseEntity.ok(cartService.getAllCarts());
    }

    @GetMapping(value = UrlNames.getCartByUserId)
    public ResponseEntity<CartResponseDTO> getCartByUserId(@PathVariable("userId") Long userId) {
        return ResponseEntity.ok(cartService.getCartByUserId(userId));
    }

    @PatchMapping(value = UrlNames.updateCart)
    public ResponseEntity<CartResponseDTO> updateCart(
            @PathVariable("cartId") Long cartId,
            @Valid @RequestBody CartUpdateDTO cartUpdateDTO) {
        return ResponseEntity.ok(cartService.updateCart(cartId, cartUpdateDTO));
    }

    @DeleteMapping(value = UrlNames.deleteCart)
    public ResponseEntity<Void> deleteCart(@PathVariable("cartId") Long cartId) {
        cartService.deleteCart(cartId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping(value = UrlNames.deleteCartItem)
    public ResponseEntity<Void> deleteCartItem(
            @PathVariable("userId") Long userId,
            @PathVariable("productId") Long productId) {
        cartService.deleteCartItem(userId, productId);
        return ResponseEntity.noContent().build();
    }
}