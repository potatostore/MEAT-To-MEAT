package meat_to_meat.demo.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import meat_to_meat.demo.dto.cart.AddCartItemRequestDTO;
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
    public ResponseEntity<CartResponseDTO> createCart(@PathVariable Long userId) {
        return ResponseEntity.ok(cartService.createCart(userId));
    }

    @PostMapping(value = UrlNames.addCartItem)
    public ResponseEntity<CartResponseDTO> addCartItem(
            @PathVariable Long userId,
            @Valid @RequestBody AddCartItemRequestDTO requestDTO) {
        return ResponseEntity.ok(cartService.addCartItem(userId, requestDTO));
    }

    @GetMapping(value = UrlNames.getAllCarts)
    public ResponseEntity<List<CartResponseDTO>> getCarts() {
        return ResponseEntity.ok(cartService.getAllCarts());
    }

    @GetMapping(value = UrlNames.getCartByUserId)
    public ResponseEntity<CartResponseDTO> getCartByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(cartService.getCartByUserId(userId));
    }

    @PatchMapping(value = UrlNames.updateCart)
    public ResponseEntity<CartResponseDTO> updateCart(
            @PathVariable Long cartId,
            @Valid @RequestBody CartUpdateDTO cartUpdateDTO) {
        return ResponseEntity.ok(cartService.updateCart(cartId, cartUpdateDTO));
    }

    @DeleteMapping(value = UrlNames.deleteCart)
    public ResponseEntity<Void> deleteCart(@PathVariable Long cartId) {
        cartService.deleteCart(cartId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping(value = UrlNames.deleteCartItem)
    public ResponseEntity<Void> deleteCartItem(
            @PathVariable Long userId,
            @PathVariable Long productId) {
        cartService.deleteCartItem(userId, productId);
        return ResponseEntity.noContent().build();
    }
}