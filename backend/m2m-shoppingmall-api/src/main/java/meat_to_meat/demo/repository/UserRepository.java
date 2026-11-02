package meat_to_meat.demo.repository;

import meat_to_meat.demo.entity.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    // UNIQUE 컬럼 기반 단건 조회 (레코드 1줄 -> Optional 반환)
    Optional<User> findByLoginId(String loginId);
    Optional<User> findByEmail(String email);

    // 회원가입 및 정보 수정 시 중복 여부 확인
    boolean existsByLoginId(String loginId);
    boolean existsByEmail(String email);
    boolean existsByPhoneNumber(String phoneNumber);
}