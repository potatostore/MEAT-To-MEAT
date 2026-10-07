package meat_to_meat.demo.controller;

import lombok.RequiredArgsConstructor;
import meat_to_meat.demo.dto.cart.CartResponseDTO;
import meat_to_meat.demo.dto.cart.CartUpdateDTO;
import meat_to_meat.demo.global.config.UrlNames;
import meat_to_meat.demo.service.CartService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * controller 에서 예외를 던지면 안됨. -> controller는 전적으로 요청이 들어왔을때, 맞는 서비스를 호출해주는 작업을 진행할 것.
 * 따라서 controller에서는 코드를 복잡하게 작성하는 것보다는 service를 부르고 종료하는게 깔끔함.
 */

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping(UrlNames.cartTableName)
@RequiredArgsConstructor
public class CartController {
    private final CartService cartService;

    // 예시
    @PostMapping(value =  UrlNames.createCartURL)
    public ResponseEntity<CartResponseDTO> createCart(@PathVariable("user_id") Long userId) {
        return ResponseEntity.ok(
                cartService.createCart(userId)
        );
    }

    // TODO: 구현 전까지 501 반환
    @GetMapping(value = UrlNames.getALLCartURL)
    public ResponseEntity<List<CartResponseDTO>> getCarts(){
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }

    @GetMapping(value = UrlNames.getCartByUserIdURL)
    public ResponseEntity<CartResponseDTO> getCartByUserIdURL(@PathVariable("user_id") Long userId){
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }

    @PatchMapping(value = UrlNames.updateCartInfoURL)
    public ResponseEntity<CartResponseDTO> updateCartInfoURL(@PathVariable("cart_id") Long cartId,
                                                             @RequestBody CartUpdateDTO cartUpdateDTO){
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }


    /**
     * 1. user삭제 시 cart도 따라서 삭제 처리해야함.
     * 2. userid + productid를 통해 cartItem을 삭제
     *
     * delete할 떄 리턴값을 넣어도 되고, void로 처리해도 되는데,
     * 통일해서 반환하기
     *
     */
    @DeleteMapping(value = UrlNames.deleteCartInfoURL)
    public ResponseEntity<CartResponseDTO> deleteCartInfoURL(@PathVariable("cart_id") Long cartId){
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }

    @DeleteMapping(value = UrlNames.deleteCartItemURL)
    public ResponseEntity<CartResponseDTO> deleteCartItemURL(@PathVariable("user_id") Long userId,
                                                             @PathVariable("product_id") Long productId){
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }
}
