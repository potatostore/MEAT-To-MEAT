package meat_to_meat.demo.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import meat_to_meat.demo.dto.cart.AddCartItemRequestDTO;
import meat_to_meat.demo.dto.cart.CartResponseDTO;
import meat_to_meat.demo.dto.cart.UpdateCartItemRequestDTO;
import meat_to_meat.demo.global.config.UrlNames;
import meat_to_meat.demo.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(UrlNames.cartBase)
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<CartResponseDTO> getCart(@AuthenticationPrincipal Long userId) {
        return ResponseEntity.ok(cartService.getCart(userId));
    }

    @PostMapping(UrlNames.cartItems)
    public ResponseEntity<CartResponseDTO> addCartItem(@AuthenticationPrincipal Long userId,
                                                       @Valid @RequestBody AddCartItemRequestDTO request) {
        return ResponseEntity.ok(cartService.addCartItem(userId, request));
    }

    @PatchMapping(UrlNames.cartItemId)
    public ResponseEntity<CartResponseDTO> updateCartItem(@AuthenticationPrincipal Long userId,
                                                          @PathVariable Long cartItemId,
                                                          @Valid @RequestBody UpdateCartItemRequestDTO request) {
        return ResponseEntity.ok(cartService.updateCartItem(userId, cartItemId, request.getQuantity()));
    }

    @DeleteMapping(UrlNames.cartItemId)
    public ResponseEntity<CartResponseDTO> removeCartItem(@AuthenticationPrincipal Long userId,
                                                          @PathVariable Long cartItemId) {
        return ResponseEntity.ok(cartService.removeCartItem(userId, cartItemId));
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(@AuthenticationPrincipal Long userId) {
        cartService.clearCart(userId);
        return ResponseEntity.noContent().build();
    }
}
