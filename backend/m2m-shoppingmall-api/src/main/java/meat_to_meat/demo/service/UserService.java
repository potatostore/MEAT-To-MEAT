package meat_to_meat.demo.service;

import lombok.RequiredArgsConstructor;
import meat_to_meat.demo.dto.user.UserCreateDTO;
import meat_to_meat.demo.dto.user.UserResponseDTO;
import meat_to_meat.demo.entity.cart.Cart;
import meat_to_meat.demo.entity.user.User;
import meat_to_meat.demo.repository.CartRepository;
import meat_to_meat.demo.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction. annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;

    @Transactional
    public UserResponseDTO createUser(UserCreateDTO userCreateDTO) {
        // 1. npe check : usercreatedto
        if(userCreateDTO == null){
            throw new IllegalArgumentException("회원가입 정보가 존재하지 않습니다.");
        }

        // 2. user entity object craete
        User inputUser = new User(userCreateDTO);

        User saveUser = userRepository.save(inputUser);

        Cart cart = new Cart(inputUser);

        return new UserResponseDTO(userRepository.save(inputUser));
    }


}
