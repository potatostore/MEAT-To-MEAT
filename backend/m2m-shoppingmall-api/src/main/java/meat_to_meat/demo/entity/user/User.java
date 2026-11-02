package meat_to_meat.demo.entity.user;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import meat_to_meat.demo.dto.user.UserCreateDTO;
import meat_to_meat.demo.dto.user.UserUpdateDTO;
import meat_to_meat.demo.entity.BaseEntity;

import java.time.LocalDate;

@Entity
@Getter
@Table(name = "users")
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class User extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    // 패스워드 unique 제거 완료
    @Column(nullable = false)
    @NotBlank
    private String userPw;

    @Column(nullable = false, length = 50)
    @NotBlank
    private String name;

    // 생일 unique 제거 완료
    @Column(nullable = false)
    private LocalDate birthday;

    @Column(unique = true, nullable = false, length = 30)
    @NotBlank
    private String loginId;

    @Column(unique = true, nullable = false, length = 100)
    @NotBlank
    private String email;

    @Column(unique = true, nullable = false, length = 30)
    @NotBlank
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Sex sex;

    // DTO 기반 생성자
    public User(UserCreateDTO dto) {
        this.loginId = dto.getLoginId();
        this.userPw = dto.getUserPw();
        this.name = dto.getName();
        this.email = dto.getEmail();
        this.phoneNumber = dto.getPhoneNumber();
        this.birthday = dto.getBirthday();
        this.sex = dto.getSex();
    }

    // 회원 정보 수정용 메서드
    public void updateUserInfo(UserUpdateDTO dto) {
        if (dto.getName() != null) {
            this.name = dto.getName();
        }
        if (dto.getPhoneNumber() != null) {
            this.phoneNumber = dto.getPhoneNumber();
        }
        if (dto.getEmail() != null) {
            this.email = dto.getEmail();
        }
    }
}