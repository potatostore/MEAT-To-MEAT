package meat_to_meat.demo.service;

import lombok.RequiredArgsConstructor;
import meat_to_meat.demo.dto.cart.CartResponseDTO;
import meat_to_meat.demo.repository.CartRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CartService {
    private final CartRepository cartRepository;

    public CartResponseDTO createCart(Long userId){
        // 1. userId npe check

        // 2. userId에 매핑되는 cart생성 : 이때 생성자는 builder로 최대한 통일

        // 3. repository에 저장

        // 4. entity를 dto로 매핑 (힌트 : dto 내부에 Entity 객체를 받는 생성자를 통해 변환)

        // 5. dto 반환
        throw new UnsupportedOperationException("TODO: createCart 미구현");
    }
}
