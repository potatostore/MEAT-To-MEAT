package meat_to_meat.demo.service;

import lombok.RequiredArgsConstructor;
import meat_to_meat.demo.dto.auth.LoginRequestDTO;
import meat_to_meat.demo.dto.auth.LoginResponseDTO;
import meat_to_meat.demo.dto.auth.SignupRequestDTO;
import meat_to_meat.demo.dto.member.ChangePasswordRequestDTO;
import meat_to_meat.demo.dto.member.MemberResponseDTO;
import meat_to_meat.demo.dto.member.UpdateMemberRequestDTO;
import meat_to_meat.demo.entity.cart.Cart;
import meat_to_meat.demo.entity.user.User;
import meat_to_meat.demo.global.exception.DuplicateException;
import meat_to_meat.demo.global.exception.ErrorCode;
import meat_to_meat.demo.global.exception.GlobalMeatToMeatException;
import meat_to_meat.demo.global.exception.NotFoundException;
import meat_to_meat.demo.global.security.JwtTokenProvider;
import meat_to_meat.demo.repository.CartRepository;
import meat_to_meat.demo.repository.OrderRepository;
import meat_to_meat.demo.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final OrderRepository orderRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    // MEM-03 회원가입 + CART-01 장바구니 생성
    @Transactional
    public MemberResponseDTO signup(SignupRequestDTO request) {
        if (userRepository.existsByLoginId(request.getLoginId())) {
            throw new DuplicateException(ErrorCode.DUPLICATE_LOGIN_ID);
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateException(ErrorCode.DUPLICATE_EMAIL);
        }
        if (userRepository.existsByPhoneNumber(request.getPhone())) {
            throw new DuplicateException(ErrorCode.DUPLICATE_PHONE_NUMBER);
        }

        User user = userRepository.save(User.builder()
                .loginId(request.getLoginId())
                .userPw(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .email(request.getEmail())
                .phoneNumber(request.getPhone())
                .sex(request.getSex())
                .birthday(request.getBirthday())
                .build());
        cartRepository.save(Cart.builder().user(user).build());

        return MemberResponseDTO.from(user);
    }

    // MEM-01 로그인: 아이디/비밀번호 확인 후 액세스 토큰 발급
    @Transactional(readOnly = true)
    public LoginResponseDTO login(LoginRequestDTO request) {
        User user = userRepository.findByLoginId(request.getLoginId())
                .filter(u -> passwordEncoder.matches(request.getPassword(), u.getUserPw()))
                .orElseThrow(() -> new GlobalMeatToMeatException(ErrorCode.LOGIN_FAILED));
        return new LoginResponseDTO(jwtTokenProvider.createToken(user.getUserId()), MemberResponseDTO.from(user));
    }

    // MEM-04 유저 정보 조회
    @Transactional(readOnly = true)
    public MemberResponseDTO getMe(Long userId) {
        return MemberResponseDTO.from(findUser(userId));
    }

    // MEM-05 유저 정보 수정
    @Transactional
    public MemberResponseDTO updateMe(Long userId, UpdateMemberRequestDTO request) {
        User user = findUser(userId);

        if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateException(ErrorCode.DUPLICATE_EMAIL);
        }
        if (!user.getPhoneNumber().equals(request.getPhone()) && userRepository.existsByPhoneNumber(request.getPhone())) {
            throw new DuplicateException(ErrorCode.DUPLICATE_PHONE_NUMBER);
        }

        user.updateInfo(request.getName(), request.getEmail(), request.getPhone());
        return MemberResponseDTO.from(user);
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequestDTO request) {
        User user = findUser(userId);
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getUserPw())) {
            throw new GlobalMeatToMeatException(ErrorCode.WRONG_CURRENT_PASSWORD);
        }
        user.changePassword(passwordEncoder.encode(request.getNewPassword()));
    }

    // MEM-06 회원 탈퇴 + CART-05 장바구니 삭제
    @Transactional
    public void withdraw(Long userId) {
        User user = findUser(userId);

        // 1. 주문 내역 삭제 (orders.user_id 가 ON DELETE RESTRICT 이므로 먼저 지운다, order_item 은 cascade)
        orderRepository.deleteAll(orderRepository.findAllByUser_UserIdOrderByCreateAtDesc(userId));
        orderRepository.flush();

        // 2. 장바구니 삭제 (cart_item 은 cascade)
        cartRepository.findByUser_UserId(userId).ifPresent(cart -> {
            cartRepository.delete(cart);
            cartRepository.flush();
        });

        // 3. FK 참조가 정리된 뒤 회원 삭제
        userRepository.delete(user);
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.USER_NOT_FOUND, "id=" + userId));
    }
}
