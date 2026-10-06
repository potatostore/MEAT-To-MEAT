package meat_to_meat.demo.controller;

import com.meat_to_meat.spb.entity.cart.Cart;
import com.meat_to_meat.spb.global.config.UrlNames;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = "http://localhost:3000")
@RestController(value = UrlNames.cartTableName)
public class CartController {
    @PostMapping(value =  UrlNames.createCartURL)
    public ResponseEntity<String> createCart(CartCreateDTO cartCreateDTO) {

    }
}
