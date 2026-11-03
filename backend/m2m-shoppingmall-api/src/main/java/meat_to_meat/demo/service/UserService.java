package meat_to_meat.demo.service;

import lombok.RequiredArgsConstructor;
import meat_to_meat.demo.dto.user.UserCreateDTO;
import meat_to_meat.demo.dto.user.UserResponseDTO;
import meat_to_meat.demo.dto.user.UserUpdateDTO;
import meat_to_meat.demo.entity.cart.Cart;
import meat_to_meat.demo.entity.user.User;
import meat_to_meat.demo.global.exception.DuplicateException;
import meat_to_meat.demo.global.exception.ErrorCode;
import meat_to_meat.demo.global.exception.NotFoundException;
import meat_to_meat.demo.global.exception.NpeCheck;
import meat_to_meat.demo.repository.CartRepository;
import meat_to_meat.demo.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;

    @Transactional
    public UserResponseDTO createUser(UserCreateDTO userCreateDTO) {
        NpeCheck.checkNotNull(userCreateDTO, ErrorCode.USER_DTO_NULL);

        if (userRepository.existsByLoginId(userCreateDTO.getLoginId())) {
            throw new DuplicateException(ErrorCode.DUPLICATE_LOGIN_ID);
        }
        if (userRepository.existsByEmail(userCreateDTO.getEmail())) {
            throw new DuplicateException(ErrorCode.DUPLICATE_EMAIL);
        }
        if (userRepository.existsByPhoneNumber(userCreateDTO.getPhoneNumber())) {
            throw new DuplicateException(ErrorCode.DUPLICATE_PHONE_NUMBER);
        }

        User inputUser = new User(userCreateDTO);
        User savedUser = userRepository.save(inputUser);

        Cart cart = new Cart(savedUser);
        cartRepository.save(cart);

        return new UserResponseDTO(savedUser);
    }

    @Transactional(readOnly = true)
    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserResponseDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserResponseDTO getUser(Long userId) {
        NpeCheck.checkNotNull(userId, ErrorCode.USER_ID_NULL);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.USER_NOT_FOUND, "id=" + userId));
        return new UserResponseDTO(user);
    }

    @Transactional
    public UserResponseDTO updateUser(Long userId, UserUpdateDTO updateDTO) {
        NpeCheck.checkNotNull(userId, ErrorCode.USER_ID_NULL);
        NpeCheck.checkNotNull(updateDTO, ErrorCode.USER_DTO_NULL);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.USER_NOT_FOUND, "id=" + userId));

        if (updateDTO.getEmail() != null && !user.getEmail().equals(updateDTO.getEmail())
                && userRepository.existsByEmail(updateDTO.getEmail())) {
            throw new DuplicateException(ErrorCode.DUPLICATE_EMAIL);
        }
        if (updateDTO.getPhoneNumber() != null && !user.getPhoneNumber().equals(updateDTO.getPhoneNumber())
                && userRepository.existsByPhoneNumber(updateDTO.getPhoneNumber())) {
            throw new DuplicateException(ErrorCode.DUPLICATE_PHONE_NUMBER);
        }

        user.updateUserInfo(updateDTO);
        return new UserResponseDTO(user);
    }

    @Transactional
    public void deleteUser(Long userId) {
        NpeCheck.checkNotNull(userId, ErrorCode.USER_ID_NULL);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.USER_NOT_FOUND, "id=" + userId));
        userRepository.delete(user);
    }
}